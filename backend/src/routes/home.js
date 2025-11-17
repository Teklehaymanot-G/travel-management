const express = require("express");
const { getTravels } = require("../controllers/travelController");
const authorize = require("../middleware/roles");
const {
  getPopularDestinations,
} = require("../controllers/analyticsController");

const router = express.Router();

// Public routes
router.get("/", getPopularDestinations);

module.exports = router;
