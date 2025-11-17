const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function subDays(date, n) {
  return new Date(date.getTime() - n * 24 * 60 * 60 * 1000);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDateRange(query) {
  const { from, to } = query;
  let fromDate = from ? new Date(from) : subDays(new Date(), 30);
  let toDate = to ? new Date(to) : new Date();
  // Normalize to day bounds
  fromDate = startOfDay(fromDate);
  toDate = endOfDay(toDate);
  return { fromDate, toDate };
}

function toNumber(val) {
  return typeof val === "number" ? val : Number(val || 0) || 0;
}

exports.getSummary = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query);
    const travelId = req.query.travelId
      ? Number(req.query.travelId)
      : undefined;

    // Payments within range (by createdAt or paymentDate if available)
    const paymentWhere = {
      AND: [
        { createdAt: { gte: fromDate } },
        { createdAt: { lte: toDate } },
        travelId ? { booking: { travelId } } : {},
      ],
    };

    const [countsByStatus, sums, bookingCount, ticketTotals, checkIns] =
      await Promise.all([
        prisma.payment.groupBy({
          by: ["status"],
          _count: { _all: true },
          where: paymentWhere,
        }),
        prisma.payment.aggregate({
          _sum: {
            finalAmount: true,
            originalAmount: true,
            discountAmount: true,
          },
          where: paymentWhere,
        }),
        prisma.booking.count({
          where: {
            createdAt: { gte: fromDate, lte: toDate },
            ...(travelId ? { travelId } : {}),
          },
        }),
        prisma.ticket.aggregate({
          _count: { _all: true },
          where: {
            createdAt: { gte: fromDate, lte: toDate },
            ...(travelId ? { booking: { travelId } } : {}),
          },
        }),
        prisma.ticket.aggregate({
          _count: { _all: true },
          where: {
            checkedIn: true,
            checkedInAt: { gte: fromDate, lte: toDate },
            ...(travelId ? { booking: { travelId } } : {}),
          },
        }),
      ]);

    const statusMap = countsByStatus.reduce((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    // Revenue by day (bucket)
    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      select: { createdAt: true, finalAmount: true, status: true },
      orderBy: { createdAt: "asc" },
    });
    const revenueByDay = {};
    payments.forEach((p) => {
      if (p.status !== "APPROVED") return;
      const d = startOfDay(p.createdAt).toISOString().slice(0, 10);
      revenueByDay[d] = toNumber(revenueByDay[d]) + toNumber(p.finalAmount);
    });

    // Top banks (string field on Payment)
    const bankGroups = await prisma.payment.groupBy({
      by: ["bank"],
      _count: { _all: true },
      _sum: { finalAmount: true },
      where: paymentWhere,
    });

    // Coupon usage
    const couponGroups = await prisma.payment.groupBy({
      by: ["couponCode"],
      _count: { _all: true },
      _sum: { discountAmount: true },
      where: { ...paymentWhere, couponCode: { not: null } },
    });

    res.json({
      range: { from: fromDate, to: toDate },
      totals: {
        payments: payments.length,
        bookings: bookingCount,
        tickets: ticketTotals._count._all,
        checkIns: checkIns._count._all,
      },
      payments: {
        status: {
          APPROVED: statusMap.APPROVED || 0,
          PENDING: statusMap.PENDING || 0,
          REJECTED: statusMap.REJECTED || 0,
        },
        amounts: {
          revenue: toNumber(sums._sum.finalAmount),
          original: toNumber(sums._sum.originalAmount),
          discounts: toNumber(sums._sum.discountAmount),
        },
        revenueByDay,
      },
      topBanks: bankGroups
        .filter((b) => (b.bank || "").trim() !== "")
        .sort(
          (a, b) => toNumber(b._sum.finalAmount) - toNumber(a._sum.finalAmount)
        )
        .slice(0, 10),
      couponUsage: couponGroups.sort(
        (a, b) =>
          toNumber(b._sum.discountAmount) - toNumber(a._sum.discountAmount)
      ),
    });
  } catch (err) {
    console.error("getSummary error", err);
    res.status(500).json({ message: "Failed to build summary" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query);
    const {
      status,
      bank,
      couponCode,
      travelId,
      page = 1,
      limit = 20,
      sort = "createdAt:desc",
    } = req.query;

    const [sortField, sortDir] = sort.split(":");

    const where = {
      AND: [
        { createdAt: { gte: fromDate } },
        { createdAt: { lte: toDate } },
        status ? { status } : {},
        bank ? { bank } : {},
        couponCode ? { couponCode } : {},
        travelId ? { booking: { travelId: Number(travelId) } } : {},
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, items] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: {
          booking: { include: { travel: true, traveler: true } },
          approvedBy: true,
        },
        orderBy: { [sortField]: sortDir === "asc" ? "asc" : "desc" },
        skip,
        take,
      }),
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), items });
  } catch (err) {
    console.error("getPayments error", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

exports.getCheckins = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query);
    const { travelId } = req.query;

    const whereTickets = {
      createdAt: { gte: fromDate, lte: toDate },
      ...(travelId ? { booking: { travelId: Number(travelId) } } : {}),
    };

    const whereChecked = {
      checkedIn: true,
      checkedInAt: { gte: fromDate, lte: toDate },
      ...(travelId ? { booking: { travelId: Number(travelId) } } : {}),
    };

    const [totalTickets, totalChecked, checkedList] = await Promise.all([
      prisma.ticket.count({ where: whereTickets }),
      prisma.ticket.count({ where: whereChecked }),
      prisma.ticket.findMany({
        where: whereChecked,
        include: {
          booking: { include: { travel: true, traveler: true } },
          checkedInBy: true,
        },
        orderBy: { checkedInAt: "desc" },
        take: 200, // cap for recent list
      }),
    ]);

    // Bucket check-ins by day
    const buckets = {};
    checkedList.forEach((t) => {
      const d = startOfDay(t.checkedInAt).toISOString().slice(0, 10);
      buckets[d] = (buckets[d] || 0) + 1;
    });

    res.json({ totalTickets, totalChecked, buckets, recent: checkedList });
  } catch (err) {
    console.error("getCheckins error", err);
    res.status(500).json({ message: "Failed to fetch check-in data" });
  }
};

exports.getCouponUsage = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query);
    const { code } = req.query;

    const where = {
      AND: [
        { createdAt: { gte: fromDate } },
        { createdAt: { lte: toDate } },
        code ? { couponCode: code } : { couponCode: { not: null } },
      ],
    };

    const groups = await prisma.payment.groupBy({
      by: ["couponCode"],
      _count: { _all: true },
      _sum: { discountAmount: true, finalAmount: true },
      where,
    });

    res.json({ items: groups });
  } catch (err) {
    console.error("getCouponUsage error", err);
    res.status(500).json({ message: "Failed to fetch coupon usage" });
  }
};

// Compare travels across key metrics within the date range
exports.compareTravels = async (req, res) => {
  try {
    const { fromDate, toDate } = parseDateRange(req.query);
    // Accept either comma-separated ids or repeated ids[] params
    let ids = [];
    if (req.query.ids) {
      if (Array.isArray(req.query.ids)) {
        ids = req.query.ids.map((v) => Number(v)).filter(Boolean);
      } else if (typeof req.query.ids === "string") {
        ids = req.query.ids
          .split(",")
          .map((v) => Number(v.trim()))
          .filter(Boolean);
      }
    }

    const travelFilter = ids.length ? { travelId: { in: ids } } : {};

    // Pull payments in range (include booking + travel)
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        booking: { ...travelFilter },
      },
      include: {
        booking: {
          include: {
            travel: { select: { id: true, title: true } },
            traveler: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Pull bookings in range
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate }, ...travelFilter },
      select: { id: true, travelId: true, travelerId: true },
    });

    // Tickets in range (created & checked-in)
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        ...(ids.length ? { booking: { travelId: { in: ids } } } : {}),
      },
      include: { booking: { select: { travelId: true } } },
    });
    const checkedTickets = await prisma.ticket.findMany({
      where: {
        checkedIn: true,
        checkedInAt: { gte: fromDate, lte: toDate },
        ...(ids.length ? { booking: { travelId: { in: ids } } } : {}),
      },
      include: { booking: { select: { travelId: true } } },
    });

    const metrics = new Map();
    const ensure = (travel) => {
      const id = travel.id || travel.travelId;
      if (!metrics.has(id)) {
        metrics.set(id, {
          travelId: id,
          travelTitle: travel.title || "",
          revenue: 0,
          paymentsApproved: 0,
          paymentsTotal: 0,
          discounts: 0,
          couponCount: 0,
          bookings: 0,
          travelers: 0,
          tickets: 0,
          checkedIns: 0,
          banks: {}, // name -> { revenue, count }
        });
      }
      return metrics.get(id);
    };

    // Seed titles from payments
    payments.forEach((p) => {
      const tr = p.booking?.travel || { id: p.booking?.travelId, title: "" };
      const m = ensure(tr);
      m.paymentsTotal += 1;
      if (p.status === "APPROVED") {
        m.paymentsApproved += 1;
        m.revenue += toNumber(p.finalAmount);
        if (p.bank) {
          const b = (m.banks[p.bank] = m.banks[p.bank] || {
            revenue: 0,
            count: 0,
          });
          b.revenue += toNumber(p.finalAmount);
          b.count += 1;
        }
      }
      if (p.couponCode) {
        m.couponCount += 1;
        m.discounts += toNumber(p.discountAmount);
      }
      // title might be empty initially, ensure set
      if (!m.travelTitle && tr.title) m.travelTitle = tr.title;
    });

    // Bookings -> bookings count and unique travelers per travel
    const travelersByTravel = new Map();
    bookings.forEach((b) => {
      const m = ensure({
        id: b.travelId,
        title: metrics.get(b.travelId)?.travelTitle || "",
      });
      m.bookings += 1;
      const set = travelersByTravel.get(b.travelId) || new Set();
      set.add(b.travelerId);
      travelersByTravel.set(b.travelId, set);
    });
    travelersByTravel.forEach((set, travelId) => {
      const m = metrics.get(travelId);
      if (m) m.travelers = set.size;
    });

    // Tickets and check-ins per travel
    tickets.forEach((t) => {
      const tid = t.booking?.travelId;
      const m = ensure({ id: tid, title: metrics.get(tid)?.travelTitle || "" });
      m.tickets += 1;
    });
    checkedTickets.forEach((t) => {
      const tid = t.booking?.travelId;
      const m = ensure({ id: tid, title: metrics.get(tid)?.travelTitle || "" });
      m.checkedIns += 1;
    });

    // Shape response
    const items = Array.from(metrics.values()).map((m) => {
      const banks = Object.entries(m.banks)
        .map(([name, v]) => ({
          name,
          revenue: toNumber(v.revenue),
          count: v.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);
      const topBank = banks[0] || null;
      return { ...m, banks, topBank };
    });

    // If ids were explicitly provided, include those with zero metrics by fetching titles
    if (ids.length) {
      const existing = new Set(items.map((i) => i.travelId));
      const missing = ids.filter((id) => !existing.has(id));
      if (missing.length) {
        const missingTravels = await prisma.travel.findMany({
          where: { id: { in: missing } },
          select: { id: true, title: true },
        });
        missingTravels.forEach((t) =>
          items.push({
            travelId: t.id,
            travelTitle: t.title,
            revenue: 0,
            paymentsApproved: 0,
            paymentsTotal: 0,
            discounts: 0,
            couponCount: 0,
            bookings: 0,
            travelers: 0,
            tickets: 0,
            checkedIns: 0,
            banks: [],
            topBank: null,
          })
        );
      }
    }

    // Sort by revenue desc by default
    items.sort((a, b) => b.revenue - a.revenue);

    res.json({ from: fromDate, to: toDate, items });
  } catch (err) {
    console.error("compareTravels error", err);
    res.status(500).json({ message: "Failed to compare travels" });
  }
};
