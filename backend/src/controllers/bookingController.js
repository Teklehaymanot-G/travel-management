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

// Create booking
const createBooking = async (req, res, next) => {
  try {
    const { travelId, travelers } = req.body;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        travelerId: req.user.id,
        travelId: parseInt(travelId),
        status: "PENDING",
      },
    });

    // Create tickets for each traveler
    const ticketPromises = travelers.map(async (traveler) => {
      const badgeNumber = generateBadgeNumber();
      const qrCodeData = `BOOKING:${booking.id}-TRAVELER:${traveler.name}`;
      const qrCodeUrl = await generateQRCode(qrCodeData);

      return prisma.ticket.create({
        data: {
          bookingId: booking.id,
          name: traveler.name,
          age: parseInt(traveler.age),
          badgeNumber,
          qrCodeUrl,
        },
      });
    });

    const tickets = await Promise.all(ticketPromises);

    res.status(201).json({
      success: true,
      data: {
        booking,
        tickets,
      },
    });
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

module.exports = {
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
};
