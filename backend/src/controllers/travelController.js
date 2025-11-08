const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

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

    // If an image file is uploaded, construct a served URL
    let imageUrl;
    if (req.file) {
      const rel = `/uploads/travels/${req.file.filename}`;
      imageUrl = `${req.protocol}://${req.get("host")}${rel}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl; // fallback support
    }

    const travel = await prisma.travel.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        imageUrl,
        itinerary,
        requirements,
        status: "PLANNED", // force default status on creation
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
        imageUrl: req.body.imageUrl,
        itinerary,
        requirements,
        status, // allow explicit status changes only via update
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

// Upload/replace travel image only
const uploadTravelImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const rel = `/uploads/travels/${req.file.filename}`;
    const imageUrl = `${req.protocol}://${req.get("host")}${rel}`;

    const travel = await prisma.travel.update({
      where: { id: parseInt(id) },
      data: { imageUrl },
    });

    res.json({ success: true, data: travel });
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
  uploadTravelImage,
};
