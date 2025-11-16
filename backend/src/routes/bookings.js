const express = require("express");
const {
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
  cancelMyBooking,
  getBookingById,
} = require("../controllers/bookingController");
const authorize = require("../middleware/roles");

const router = express.Router();

// User routes
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelMyBooking);

// Admin routes
router.get("/", authorize(["MANAGER", "SUPERVISOR"]), getAllBookings);
router.get("/:id", authorize(["MANAGER", "SUPERVISOR"]), getBookingById);
router.patch(
  "/:id/status",
  authorize(["MANAGER", "SUPERVISOR"]),
  updateBookingStatus
);

module.exports = router;
