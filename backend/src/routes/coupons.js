const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
// Potential: role-based middleware if only managers can manage coupons
const controller = require("../controllers/couponController");

// All routes protected for now
router.use(auth);

router.get("/", controller.listCoupons);
router.post("/", controller.createCoupon);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);
router.patch("/:id/toggle-active", controller.toggleActive);

module.exports = router;
