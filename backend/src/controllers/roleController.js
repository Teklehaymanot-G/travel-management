const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all roles (for reference)
const getRoles = async (req, res, next) => {
  try {
    // Since roles are defined as enums in Prisma, we'll return the enum values
    const roles = Object.values(prisma.Role);

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = Object.values(prisma.Role);
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Valid roles are: " + validRoles.join(", "),
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get users by role
const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate role
    const validRoles = Object.values(prisma.Role);
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Valid roles are: " + validRoles.join(", "),
      });
    }

    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            comments: true,
            travels: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.user.count({ where: { role } });

    res.json({
      success: true,
      data: users,
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

module.exports = {
  getRoles,
  updateUserRole,
  getUsersByRole,
};
