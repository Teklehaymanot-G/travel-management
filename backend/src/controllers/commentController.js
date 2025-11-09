const { PrismaClient, Prisma } = require("@prisma/client");
const jwt = require("jsonwebtoken");
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
      const normalizedType = String(type).toUpperCase();
      where.type = normalizedType;
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
        _count: {
          select: { likes: true },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.comment.count({ where });

    // Determine likedByMe by decoding token if provided (optional auth)
    let likedByMeMap = new Map();
    try {
      const auth = req.header("Authorization");
      if (auth && auth.startsWith("Bearer ")) {
        const token = auth.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
          const ids = comments.map((c) => c.id);
          if (ids.length) {
            const likes = await prisma.commentLike.findMany({
              where: { userId: decoded.id, commentId: { in: ids } },
              select: { commentId: true },
            });
            likedByMeMap = new Map(likes.map((l) => [l.commentId, true]));
          }
        }
      }
    } catch (e) {
      // ignore token errors for public access
    }

    res.json({
      success: true,
      data: comments.map((c) => ({
        ...c,
        likesCount: c._count?.likes || 0,
        likedByMe: likedByMeMap.get(c.id) || false,
      })),
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

    // Validate comment type (robust to Prisma enum availability)
    const validTypes = (Prisma &&
      Prisma.CommentType &&
      Object.values(Prisma.CommentType)) || ["PRE_TRAVEL", "POST_TRAVEL"];
    const normalizedType = String(type || "PRE_TRAVEL").toUpperCase();
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({
        message:
          "Invalid comment type. Valid types are: " + validTypes.join(", "),
      });
    }

    let comment;
    try {
      comment = await prisma.comment.create({
        data: {
          content,
          type: normalizedType,
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
    } catch (err) {
      // Provide clearer error details in development
      if (process.env.NODE_ENV !== "production") {
        console.error("Comment creation error:", err);
      }
      return res.status(500).json({ message: "Failed to create comment" });
    }

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
      return res.status(403).json({
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

// Like a comment (idempotent)
const likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentId = parseInt(id);
    // Ensure comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Create like if not exists
    await prisma.commentLike.upsert({
      where: { commentId_userId: { commentId, userId: req.user.id } },
      create: { commentId, userId: req.user.id },
      update: {},
    });

    const count = await prisma.commentLike.count({ where: { commentId } });
    res.json({ success: true, data: { likesCount: count, likedByMe: true } });
  } catch (error) {
    next(error);
  }
};

// Unlike a comment (idempotent)
const unlikeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentId = parseInt(id);
    // Ensure comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Delete like if exists
    await prisma.commentLike.deleteMany({
      where: { commentId, userId: req.user.id },
    });

    const count = await prisma.commentLike.count({ where: { commentId } });
    res.json({ success: true, data: { likesCount: count, likedByMe: false } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelComments,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
