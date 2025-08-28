const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get payments
const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            travel: {
              select: {
                id: true,
                title: true,
              },
            },
            traveler: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

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

// Create payment
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, receiptUrl } = req.body;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns the booking
    if (booking.travelerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        receiptUrl,
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
    const { status } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedById: status === "APPROVED" ? req.user.id : null,
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

    // If payment is approved, update booking status
    if (status === "APPROVED") {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "APPROVED" },
      });
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
