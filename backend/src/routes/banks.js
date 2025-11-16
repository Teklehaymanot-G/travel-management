const express = require("express");
const {
  listBanks,
  createBank,
  updateBank,
  toggleBankStatus,
  deleteBank,
} = require("../controllers/bankController");
const upload = require("../middleware/upload");
const authorize = require("../middleware/roles");

const router = express.Router();

// Public list (can restrict later if needed)
router.get("/", listBanks);

// Management routes
router.post(
  "/",
  authorize(["MANAGER", "SUPERVISOR"]),
  (req, _res, next) => {
    req.uploadTarget = "banks";
    next();
  },
  upload.single("logo"),
  createBank
);
router.patch(
  "/:id",
  authorize(["MANAGER", "SUPERVISOR"]),
  (req, _res, next) => {
    req.uploadTarget = "banks";
    next();
  },
  upload.single("logo"),
  updateBank
);
router.patch(
  "/:id/toggle",
  authorize(["MANAGER", "SUPERVISOR"]),
  toggleBankStatus
);
router.delete("/:id", authorize(["MANAGER", "SUPERVISOR"]), deleteBank);

module.exports = router;
