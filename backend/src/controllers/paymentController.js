const { PrismaClient } = require("@prisma/client");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

const generateBadgeNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BN-${timestamp}-${random}`.toUpperCase();
};

const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error("QR Code generation error:", err);
    return null;
  }
};

// Get payments
const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    let payments;
    try {
      payments = await prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              travel: { select: { id: true, title: true } },
              traveler: { select: { id: true, name: true, phone: true } },
            },
          },
          approvedBy: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      // Handle orphaned payments referencing missing booking rows
      if (
        typeof e?.message === "string" &&
        e.message.includes("Field booking is required")
      ) {
        try {
          await prisma.$executeRaw`DELETE FROM Payment WHERE bookingId NOT IN (SELECT id FROM Booking)`;
          payments = await prisma.payment.findMany({
            where,
            include: {
              booking: {
                include: {
                  travel: { select: { id: true, title: true } },
                  traveler: { select: { id: true, name: true, phone: true } },
                },
              },
              approvedBy: { select: { id: true, name: true } },
            },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            orderBy: { createdAt: "desc" },
          });
        } catch (cleanupErr) {
          console.error("Payment orphan cleanup failed", cleanupErr.message);
          throw e; // rethrow original error
        }
      } else {
        throw e;
      }
    }

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create payment (or resubmit if previously rejected)
const createPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      receiptUrl,
      transactionNumber,
      bank,
      paymentDate,
      couponCode,
    } = req.body;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        travel: { select: { price: true, title: true, id: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns the booking
    if (booking.travelerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Compute base/original amount from travel price and participants count if available
    let participantsCount = 1;
    try {
      const fresh = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        select: { participants: true },
      });
      if (fresh?.participants && Array.isArray(fresh.participants)) {
        participantsCount = Math.max(1, fresh.participants.length);
      }
    } catch {}
    const originalAmount = booking?.travel?.price
      ? Number(booking.travel.price) * participantsCount
      : null;

    // Validate coupon if provided
    let appliedCouponCode = null;
    let discountAmount = null;
    if (
      couponCode &&
      typeof couponCode === "string" &&
      couponCode.trim().length > 0
    ) {
      const code = couponCode.trim();
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
      const now = new Date();
      if (!coupon.active)
        return res.status(400).json({ message: "Coupon inactive" });
      if (coupon.validFrom > now)
        return res.status(400).json({ message: "Coupon not yet valid" });
      if (coupon.validTo < now)
        return res.status(400).json({ message: "Coupon expired" });
      if (coupon.maxUses && coupon.used >= coupon.maxUses)
        return res.status(400).json({ message: "Coupon usage limit reached" });
      if (originalAmount === null)
        return res
          .status(400)
          .json({ message: "Cannot compute base amount for discount" });
      if (coupon.type === "PERCENT") {
        discountAmount = Math.min(
          originalAmount,
          Math.round((originalAmount * coupon.discount) / 100)
        );
      } else {
        discountAmount = Math.min(originalAmount, coupon.discount);
      }
      appliedCouponCode = code;
    }

    // If payment exists and was rejected, allow resubmission via update; otherwise prevent duplicates
    const existing = await prisma.payment.findUnique({
      where: { bookingId: parseInt(bookingId) },
      include: {
        booking: {
          include: {
            travel: { select: { id: true, title: true } },
          },
        },
      },
    });

    let payment;
    if (existing) {
      if (existing.status !== "REJECTED") {
        return res.status(400).json({ message: "Payment already submitted" });
      }
      payment = await prisma.payment.update({
        where: { id: existing.id },
        data: {
          receiptUrl,
          transactionNumber:
            transactionNumber || existing.transactionNumber || null,
          bank: bank || existing.bank || null,
          paymentDate: paymentDate
            ? new Date(paymentDate)
            : existing.paymentDate || null,
          status: "PENDING",
          approvedById: null,
          rejectionMessage: null,
          // Replace coupon and amount values on resubmit
          couponCode: appliedCouponCode || null,
          originalAmount: originalAmount ?? existing.originalAmount ?? null,
          discountAmount: discountAmount ?? existing.discountAmount ?? null,
          finalAmount:
            originalAmount != null
              ? originalAmount - (discountAmount || 0)
              : existing.finalAmount ?? null,
        },
        include: {
          booking: {
            include: {
              travel: { select: { id: true, title: true } },
            },
          },
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId: parseInt(bookingId),
          receiptUrl,
          transactionNumber: transactionNumber || null,
          bank: bank || null,
          paymentDate: paymentDate ? new Date(paymentDate) : null,
          couponCode: appliedCouponCode || null,
          originalAmount: originalAmount,
          discountAmount: discountAmount,
          finalAmount:
            originalAmount != null
              ? originalAmount - (discountAmount || 0)
              : null,
        },
        include: {
          booking: {
            include: {
              travel: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedById: status === "APPROVED" ? req.user.id : null,
        rejectionMessage: status === "REJECTED" ? message || null : null,
      },
      include: {
        booking: {
          include: {
            travel: true,
            traveler: true,
            tickets: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If payment is approved, update booking status and generate tickets if missing
    if (status === "APPROVED") {
      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "APPROVED" },
      });

      // Increment coupon usage if applied
      if (payment.couponCode) {
        try {
          await prisma.coupon.update({
            where: { code: payment.couponCode },
            data: { used: { increment: 1 } },
          });
        } catch (e) {
          // ignore
        }
      }

      // Generate tickets if none exist yet
      const existingTickets = payment.booking.tickets || [];
      if (existingTickets.length === 0) {
        // Determine participants
        let participants = [];
        try {
          const fresh = await prisma.booking.findUnique({
            where: { id: payment.bookingId },
            select: { participants: true, id: true },
          });
          if (fresh?.participants && Array.isArray(fresh.participants)) {
            participants = fresh.participants;
          }
        } catch (e) {
          // ignore
        }

        if (!participants.length) {
          // Fallback: single ticket with traveler name
          participants = [
            {
              name:
                payment.booking?.traveler?.name ||
                payment.booking?.traveler?.phone ||
                "Traveler",
              age: 18,
            },
          ];
        }

        // Ensure ticket uploads directory exists (for file-based QR fallback/storage)
        // Store tickets under src/uploads/tickets (one level up from controllers)
        const uploadsDir = path.join(__dirname, "..", "uploads", "tickets");
        try {
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
        } catch (e) {
          console.warn("Failed to ensure tickets upload directory", e.message);
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const ticketCreates = await Promise.all(
          participants.map(async (p, idx) => {
            const badgeNumber = generateBadgeNumber();
            const qrCodeData = `BOOKING:${payment.bookingId}-IDX:${
              idx + 1
            }-NAME:${p.name}`;
            let qrCodeDataUrl = await generateQRCode(qrCodeData);
            let storedQr = qrCodeDataUrl; // default to data URI
            if (qrCodeDataUrl && qrCodeDataUrl.startsWith("data:image")) {
              try {
                const base64 = qrCodeDataUrl.split(",")[1];
                const fileName = `qr_${payment.bookingId}_${
                  idx + 1
                }_${Date.now()}.png`;
                const filePath = path.join(uploadsDir, fileName);
                fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
                // Store relative URL; clients prepend their own base origin
                storedQr = `/uploads/tickets/${fileName}`;
              } catch (e) {
                console.warn(
                  "QR file write failed; falling back to data URI",
                  e.message
                );
                storedQr = qrCodeDataUrl; // fallback
              }
            }
            return prisma.ticket.create({
              data: {
                bookingId: payment.bookingId,
                name: String(p.name || `Traveler ${idx + 1}`),
                age: Number.parseInt(p.age || 18),
                badgeNumber,
                qrCodeUrl: storedQr,
              },
            });
          })
        );

        // Attach tickets to response via re-fetch
        payment.booking.tickets = ticketCreates;
      }
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePaymentStatus,
};
