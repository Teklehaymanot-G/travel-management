const express = require("express");
const {
  requestRegisterOtp,
  verifyRegisterOtp,
  registerWithPassword,
  login,
  getMe,
  updateMe,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register/request-otp", requestRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/register", registerWithPassword);
router.post("/login", login);
router.get("/me", auth, getMe);
router.patch(
  "/me",
  auth,
  (req, res, next) => {
    req.uploadTarget = "profiles";
    next();
  },
  upload.single("image"),
  updateMe
);

module.exports = router;
