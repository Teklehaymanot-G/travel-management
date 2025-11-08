const express = require("express");
const {
  getTravels,
  getTravel,
  createTravel,
  updateTravel,
  deleteTravel,
  uploadTravelImage,
} = require("../controllers/travelController");
const authorize = require("../middleware/roles");
const upload = require("../middleware/upload");

const router = express.Router();

// Public routes
router.get("/", getTravels);
router.get("/:id", getTravel);

// Protected routes (Manager only)
router.post("/", authorize(["MANAGER"]), upload.single("image"), createTravel);
router.put("/:id", authorize(["MANAGER"]), updateTravel);
router.delete("/:id", authorize(["MANAGER"]), deleteTravel);

// Upload/replace travel header image
router.put(
  "/:id/image",
  authorize(["MANAGER"]),
  upload.single("image"),
  uploadTravelImage
);

module.exports = router;
