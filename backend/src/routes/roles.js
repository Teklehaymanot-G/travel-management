const express = require("express");
const {
  getRoles,
  updateUserRole,
  getUsersByRole,
} = require("../controllers/roleController");
const authorize = require("../middleware/roles");

const router = express.Router();

// All routes are protected and require MANAGER role
router.use(authorize(["MANAGER"]));

// Get all available roles
router.get("/", getRoles);

// Get users by role
router.get("/:role/users", getUsersByRole);

// Update user role
router.patch("/user/:userId", updateUserRole);

module.exports = router;
