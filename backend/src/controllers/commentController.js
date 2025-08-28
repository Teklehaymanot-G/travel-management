const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all comments for a travel
const getTravelComments = async (req, res, next) => {
  try {
    const { travelId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    const where = { travelId: parseInt(travelId) };

    if (type && type !== "all") {
      where.type = type;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.comment.count({ where });

    res.json({
      success: true,
      data: comments,
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

// Create comment
const createComment = async (req, res, next) => {
  try {
    const { travelId } = req.params;
    const { content, type = "PRE_TRAVEL" } = req.body;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    // Validate comment type
    const validTypes = Object.values(prisma.CommentType);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message:
          "Invalid comment type. Valid types are: " + validTypes.join(", "),
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        type,
        travelerId: req.user.id,
        travelId: parseInt(travelId),
      },
      include: {
        traveler: {
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
      data: comment,
      message: "Comment created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        traveler: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user has permission to delete comment
    // Users can only delete their own comments, managers can delete any comment
    if (comment.traveler.id !== req.user.id && req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({
          message: "Access denied. You can only delete your own comments.",
        });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelComments,
  createComment,
  deleteComment,
};
