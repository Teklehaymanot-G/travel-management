const express = require("express");
const {
  getTravelDocuments,
  uploadDocument,
  deleteDocument,
} = require("../controllers/documentController");
const authorize = require("../middleware/roles");

const router = express.Router();

// Get documents for a travel (public route, no auth required)
router.get("/travel/:travelId", getTravelDocuments);

// All other routes require authentication
router.use(authorize(["MANAGER", "SUPERVISOR"]));

// Upload document
router.post("/travel/:travelId", uploadDocument);

// Delete document
router.delete("/:id", deleteDocument);

module.exports = router;
