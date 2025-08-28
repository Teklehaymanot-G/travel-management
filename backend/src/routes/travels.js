const express = require("express");
const {
  getTravels,
  getTravel,
  createTravel,
  updateTravel,
  deleteTravel,
} = require("../controllers/travelController");
const authorize = require("../middleware/roles");

const router = express.Router();

// Public routes
router.get("/", getTravels);
router.get("/:id", getTravel);

// Protected routes (Manager only)
router.post("/", authorize(["MANAGER"]), createTravel);
router.put("/:id", authorize(["MANAGER"]), updateTravel);
router.delete("/:id", authorize(["MANAGER"]), deleteTravel);

module.exports = router;
