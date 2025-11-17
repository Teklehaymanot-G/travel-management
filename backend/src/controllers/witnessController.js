const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// Public: list published witnesses
const listPublic = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    const where = {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.witness.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, role: true } },
          _count: { select: { comments: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.witness.count({ where }),
    ]);

    res.json({
      success: true,
      data: items.map((w) => ({
        ...w,
        commentsCount: w._count?.comments || 0,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Public: get single published witness with comments
const getPublicById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const witness = await prisma.witness.findFirst({
      where: { id, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
    if (!witness) return res.status(404).json({ message: "Witness not found" });

    res.json({ success: true, data: witness });
  } catch (err) {
    next(err);
  }
};

// Admin: list all with optional status filter
const listAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, q } = req.query;
    const where = {
      ...(status && status !== "all"
        ? { status: String(status).toUpperCase() }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.witness.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, role: true } },
          _count: { select: { comments: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.witness.count({ where }),
    ]);
    res.json({
      success: true,
      data: items.map((w) => ({
        ...w,
        commentsCount: w._count?.comments || 0,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: create witness (default DRAFT)
const createWitness = async (req, res, next) => {
  try {
    const { title, content, status } = req.body;
    const data = {
      title,
      content,
      status:
        status && ["DRAFT", "PUBLISHED"].includes(String(status).toUpperCase())
          ? String(status).toUpperCase()
          : "DRAFT",
      authorId: req.user.id,
    };
    const created = await prisma.witness.create({ data });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

// Admin: update witness fields
const updateWitness = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, content, status } = req.body;
    const update = {};
    if (typeof title === "string") update.title = title;
    if (typeof content === "string") update.content = content;
    if (typeof status === "string") {
      const s = String(status).toUpperCase();
      if (["DRAFT", "PUBLISHED"].includes(s)) update.status = s;
    }

    const existing = await prisma.witness.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: "Witness not found" });

    const updated = await prisma.witness.update({
      where: { id },
      data: update,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: set publish status (PATCH)
const setStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const s = String(status || "").toUpperCase();
    if (!["DRAFT", "PUBLISHED"].includes(s)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const existing = await prisma.witness.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: "Witness not found" });
    const updated = await prisma.witness.update({
      where: { id },
      data: { status: s },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: delete (with comments cleanup)
const deleteWitness = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.witness.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: "Witness not found" });

    await prisma.$transaction([
      prisma.witnessComment.deleteMany({ where: { witnessId: id } }),
      prisma.witness.delete({ where: { id } }),
    ]);

    res.json({ success: true, message: "Witness deleted" });
  } catch (err) {
    next(err);
  }
};

// Comments: list
const listComments = async (req, res, next) => {
  try {
    const witnessId = Number(req.params.id);
    const { page = 1, limit = 10 } = req.query;

    const witness = await prisma.witness.findUnique({
      where: { id: witnessId },
    });
    if (!witness || witness.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Witness not found" });
    }

    const [items, total] = await Promise.all([
      prisma.witnessComment.findMany({
        where: { witnessId },
        include: { user: { select: { id: true, name: true, role: true } } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.witnessComment.count({ where: { witnessId } }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Comments: add
const addComment = async (req, res, next) => {
  try {
    const witnessId = Number(req.params.id);
    const { content } = req.body;
    const user = req.user;

    const witness = await prisma.witness.findUnique({
      where: { id: witnessId },
    });
    if (!witness) return res.status(404).json({ message: "Witness not found" });

    // Travelers can comment only on published; managers/supervisors on any
    const role = (user?.role || "").toUpperCase();
    if (role === "TRAVELER" && witness.status !== "PUBLISHED") {
      return res
        .status(403)
        .json({ message: "Cannot comment on an unpublished post." });
    }

    const created = await prisma.witnessComment.create({
      data: { content, witnessId, userId: user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

// Comments: delete
const deleteComment = async (req, res, next) => {
  try {
    const id = Number(req.params.commentId);
    const user = req.user;
    const comment = await prisma.witnessComment.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const role = (user?.role || "").toUpperCase();
    if (
      !(role === "MANAGER" || role === "SUPERVISOR") &&
      comment.user.id !== user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.witnessComment.delete({ where: { id } });
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublic,
  getPublicById,
  listAdmin,
  createWitness,
  updateWitness,
  setStatus,
  deleteWitness,
  listComments,
  addComment,
  deleteComment,
};
