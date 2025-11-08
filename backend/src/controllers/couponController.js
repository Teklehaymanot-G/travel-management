const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to normalize coupon output (lowercase type for frontend convenience)
const serialize = (c) => ({ ...c, type: c.type.toLowerCase() });

// Compute status similar to frontend logic
const computeStatus = (c) => {
  const now = new Date();
  if (c.validFrom > now) return "upcoming";
  if (c.validTo < now) return "expired";
  return c.active ? "active" : "inactive";
};

// GET /api/coupons
const listCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", type, status } = req.query;
    const where = {};
    if (search) {
      where.code = { contains: search, mode: "insensitive" };
    }
    if (type && ["percent", "fixed"].includes(type)) {
      where.type = type.toUpperCase();
    }
    // Status filtering (active/inactive only inside DB; upcoming/expired require date logic after fetch)
    if (status === "active") where.active = true;
    if (status === "inactive") where.active = false;

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // Pull a slightly larger page if filtering upcoming/expired to avoid empty sets from date post-filter
    const baseCoupons = await prisma.coupon.findMany({
      where,
      skip,
      take: status === "upcoming" || status === "expired" ? take * 2 : take,
      orderBy: { createdAt: "desc" },
    });
    let filtered = baseCoupons.map(serialize);

    if (status === "upcoming" || status === "expired") {
      filtered = filtered.filter((c) => computeStatus(c) === status);
    }

    const total = await prisma.coupon.count({ where });
    res.json({
      success: true,
      data: filtered,
      total,
      page: parseInt(page),
      limit: take,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons
const createCoupon = async (req, res, next) => {
  try {
    let {
      code,
      description,
      type = "percent",
      discount,
      validFrom,
      validTo,
      maxUses,
      active = true,
    } = req.body;
    if (!code || !discount || !validFrom || !validTo) {
      return res
        .status(400)
        .json({ message: "code, discount, validFrom, validTo are required" });
    }
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    type = type.toUpperCase();
    if (!["PERCENT", "FIXED"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    discount = parseInt(discount);
    if (type === "PERCENT" && (discount < 1 || discount > 100)) {
      return res
        .status(400)
        .json({ message: "Percent discount must be 1-100" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        type,
        discount,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        maxUses: maxUses ? parseInt(maxUses) : null,
        active: !!active,
      },
    });
    res.status(201).json({ success: true, data: serialize(coupon) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { description, type, discount, validFrom, validTo, maxUses, active } =
      req.body;
    const existing = await prisma.coupon.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return res.status(404).json({ message: "Coupon not found" });
    if (type) type = type.toUpperCase();
    if (type && !["PERCENT", "FIXED"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    const data = {};
    if (description !== undefined) data.description = description;
    if (type) data.type = type;
    if (discount !== undefined) data.discount = parseInt(discount);
    if (validFrom) data.validFrom = new Date(validFrom);
    if (validTo) data.validTo = new Date(validTo);
    if (maxUses !== undefined)
      data.maxUses = maxUses ? parseInt(maxUses) : null;
    if (active !== undefined) data.active = !!active;

    const updated = await prisma.coupon.update({
      where: { id: existing.id },
      data,
    });
    res.json({ success: true, data: serialize(updated) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return res.status(404).json({ message: "Coupon not found" });
    await prisma.coupon.delete({ where: { id: existing.id } });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/coupons/:id/toggle-active
const toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return res.status(404).json({ message: "Coupon not found" });
    const updated = await prisma.coupon.update({
      where: { id: existing.id },
      data: { active: !existing.active },
    });
    res.json({ success: true, data: serialize(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleActive,
};
