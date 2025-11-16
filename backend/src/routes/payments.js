const express = require("express");
const {
  getPayments,
  createPayment,
  updatePaymentStatus,
} = require("../controllers/paymentController");
const authorize = require("../middleware/roles");

const router = express.Router();

// User routes
router.post("/", createPayment);

// Admin routes
router.get("/", authorize(["MANAGER", "SUPERVISOR"]), getPayments);
// Allow MANAGER and SUPERVISOR to approve/reject payments
router.patch(
  "/:id/status",
  authorize(["MANAGER", "SUPERVISOR"]),
  updatePaymentStatus
);

module.exports = router;
