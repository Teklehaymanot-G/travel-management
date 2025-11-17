const express = require("express");
const authorize = require("../middleware/roles");
const {
  getSummary,
  getPayments,
  getCheckins,
  getCouponUsage,
  compareTravels,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/summary", authorize(["MANAGER", "SUPERVISOR"]), getSummary);

router.get("/payments", authorize(["MANAGER", "SUPERVISOR"]), getPayments);

router.get("/checkins", authorize(["MANAGER", "SUPERVISOR"]), getCheckins);

router.get("/coupons", authorize(["MANAGER", "SUPERVISOR"]), getCouponUsage);

router.get(
  "/travels/compare",
  authorize(["MANAGER", "SUPERVISOR"]),
  compareTravels
);

module.exports = router;
