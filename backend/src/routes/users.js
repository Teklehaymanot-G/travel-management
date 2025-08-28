const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authorize = require("../middleware/roles");

const router = express.Router();

// All routes require authentication
router.use(authorize(["MANAGER", "SUPERVISOR"]));

// Get all users (managers and supervisors)
router.get("/", getUsers);

// Get user by ID (managers and supervisors)
router.get("/:id", getUser);

// Create user (managers only)
router.post("/", authorize(["MANAGER"]), createUser);

// Update user (managers only)
router.put("/:id", authorize(["MANAGER"]), updateUser);

// Delete user (managers only)
router.delete("/:id", authorize(["MANAGER"]), deleteUser);

module.exports = router;
