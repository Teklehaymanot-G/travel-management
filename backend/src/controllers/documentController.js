const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all documents for a travel
const getTravelDocuments = async (req, res, next) => {
  try {
    const { travelId } = req.params;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    const documents = await prisma.travelDocument.findMany({
      where: { travelId: parseInt(travelId) },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// Upload document
const uploadDocument = async (req, res, next) => {
  try {
    const { travelId } = req.params;
    const { title } = req.body;

    // In a real app, you'd handle file upload with multer
    // For now, we'll assume fileUrl is provided in the request
    const { fileUrl } = req.body;

    // Check if travel exists
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }

    // Check if user has permission to upload documents
    // Only managers and supervisors can upload documents
    if (!["MANAGER", "SUPERVISOR"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    const document = await prisma.travelDocument.create({
      data: {
        travelId: parseInt(travelId),
        title,
        fileUrl,
      },
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const document = await prisma.travelDocument.findUnique({
      where: { id: parseInt(id) },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user has permission to delete documents
    // Only managers and supervisors can delete documents
    if (!["MANAGER", "SUPERVISOR"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    await prisma.travelDocument.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelDocuments,
  uploadDocument,
  deleteDocument,
};
