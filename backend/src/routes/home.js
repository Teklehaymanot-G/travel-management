const express = require("express");
const { getTravels } = require("../controllers/travelController");
const authorize = require("../middleware/roles");

const router = express.Router();

// Public routes
router.get("/", getTravels);

module.exports = router;
