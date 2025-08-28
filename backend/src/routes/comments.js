const express = require("express");
const {
  getTravelComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");
const auth = require("../middleware/auth");

const router = express.Router();

// Get comments for a travel (public route, no auth required)
router.get("/travel/:travelId", getTravelComments);

// All other routes require authentication
router.use(auth);

// Create comment
router.post("/travel/:travelId", createComment);

// Delete comment
router.delete("/:id", deleteComment);

module.exports = router;
