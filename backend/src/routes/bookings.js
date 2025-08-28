const express = require("express");
const {
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
} = require("../controllers/bookingController");
const authorize = require("../middleware/roles");

const router = express.Router();

// User routes
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);

// Admin routes
router.get("/", authorize(["MANAGER", "SUPERVISOR"]), getAllBookings);
router.patch(
  "/:id/status",
  authorize(["MANAGER", "SUPERVISOR"]),
  updateBookingStatus
);

module.exports = router;
