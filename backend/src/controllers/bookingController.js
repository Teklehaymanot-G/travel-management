const { PrismaClient } = require("@prisma/client");
const QRCode = require("qrcode");
const prisma = new PrismaClient();

// Generate QR Code
const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error("QR Code generation error:", err);
    return null;
  }
};

// Generate badge number
const generateBadgeNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BN-${timestamp}-${random}`.toUpperCase();
};

// Get user bookings
const getUserBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { travelerId: req.user.id };

    if (status && status !== "all") {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        travel: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            price: true,
            imageUrl: true,
          },
        },
        tickets: true,
        payment: true,
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: bookings,
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

// Get all bookings (for managers/supervisors)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, travelId } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (travelId) {
      where.travelId = parseInt(travelId);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        travel: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        traveler: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        tickets: true,
        payment: true,
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: bookings,
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

// Create booking (defer ticket creation until payment approval)
const createBooking = async (req, res, next) => {
  try {
    const { travelId, travelers = [] } = req.body;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    // Persist booking with participants JSON, status PENDING
    const booking = await prisma.booking.create({
      data: {
        travelerId: req.user.id,
        travelId: parseInt(travelId),
        status: "PENDING",
        participants: Array.isArray(travelers)
          ? travelers.map((t) => {
              const ageGroup = t?.ageGroup || null;
              const gender = t?.gender || null;
              let ageValue = Number.parseInt(t?.age || 0);
              if (!ageValue || Number.isNaN(ageValue)) {
                // derive representative age from group
                const group = String(ageGroup || "").trim();
                if (group === "<10") ageValue = 8;
                else if (group === "10-18") ageValue = 14;
                else if (group === "18-35") ageValue = 26;
                else if (group === "35-50") ageValue = 42;
                else if (group === ">50") ageValue = 55;
                else ageValue = 18;
              }
              return {
                name: String(t?.name || "Traveler"),
                age: ageValue,
                ageGroup: ageGroup,
                gender: gender,
              };
            })
          : undefined,
      },
      include: {
        travel: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        traveler: { select: { id: true, name: true, phone: true } },
        tickets: true,
      },
    });

    // No tickets yet; payment flow will generate tickets upon approval
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// Update booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        travel: true,
        traveler: true,
        tickets: true,
      },
    });

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel own booking (traveler)
const cancelMyBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, travelerId: true, status: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.travelerId !== req.user.id && req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "REJECTED") {
      return res.json({ success: true, data: booking });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "REJECTED" },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Get booking by id (admin)
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        travel: true,
        traveler: { select: { id: true, name: true, phone: true } },
        tickets: true,
        payment: true,
      },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
  cancelMyBooking,
  getBookingById,
};
