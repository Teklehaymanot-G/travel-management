const express = require("express");
const authorize = require("../middleware/roles");
const {
  getPopularDestinations,
} = require("../controllers/analyticsController");

const router = express.Router();

// Managers & Supervisors only
router.get(
  "/popular-destinations",
  authorize(["MANAGER", "SUPERVISOR"]),
  getPopularDestinations
);

module.exports = router;
