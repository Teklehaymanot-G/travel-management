const express = require("express");
const { scanTicket } = require("../controllers/ticketController");
const authorize = require("../middleware/roles");

const router = express.Router();

// Scan/verify ticket QR code
router.post("/scan", authorize(["SUPERVISOR", "MANAGER"]), scanTicket);

module.exports = router;
