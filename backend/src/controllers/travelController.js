const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all travels with filters
const getTravels = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const travels = await prisma.travel.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            comments: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.travel.count({ where });

    res.json({
      success: true,
      data: travels,
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

// Get single travel
const getTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        bookings: {
          include: {
            traveler: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        documents: true,
        comments: {
          include: {
            traveler: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    res.json({
      success: true,
      data: travel,
    });
  } catch (error) {
    next(error);
  }
};

// Create travel
const createTravel = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      price,
      itinerary,
      requirements,
    } = req.body;

    const travel = await prisma.travel.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        itinerary,
        requirements,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: travel,
    });
  } catch (error) {
    next(error);
  }
};

// Update travel
const updateTravel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      price,
      itinerary,
      requirements,
      status,
    } = req.body;

    const travel = await prisma.travel.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        price: price ? parseFloat(price) : undefined,
        itinerary,
        requirements,
        status,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: travel,
    });
  } catch (error) {
    next(error);
  }
};

// Delete travel
const deleteTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.travel.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Travel deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravels,
  getTravel,
  createTravel,
  updateTravel,
  deleteTravel,
};
