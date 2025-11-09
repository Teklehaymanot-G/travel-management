const express = require("express");
const { requestRegisterOtp, verifyRegisterOtp, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register/request-otp", requestRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/login", login);
router.get("/me", auth, getMe);

module.exports = router;
