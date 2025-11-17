const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/roles");
const {
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
} = require("../controllers/witnessController");

const router = express.Router();

// Public endpoints
router.get("/public", listPublic);
router.get("/:id", getPublicById);
router.get("/:id/comments", listComments);

// Admin endpoints
router.get(
  "/admin/list",
  auth,
  authorize(["MANAGER", "SUPERVISOR"]),
  listAdmin
);
router.post("/", auth, authorize(["MANAGER", "SUPERVISOR"]), createWitness);
router.put("/:id", auth, authorize(["MANAGER", "SUPERVISOR"]), updateWitness);
router.patch(
  "/:id/status",
  auth,
  authorize(["MANAGER", "SUPERVISOR"]),
  setStatus
);
router.delete(
  "/:id",
  auth,
  authorize(["MANAGER", "SUPERVISOR"]),
  deleteWitness
);

// Comments (auth for mutations)
router.post("/:id/comments", auth, addComment);
router.delete("/comments/:commentId", auth, deleteComment);

module.exports = router;
