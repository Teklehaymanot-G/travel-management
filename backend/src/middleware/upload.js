const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Root uploads directory
const uploadsRoot = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

// Ensure default 'travels' subfolder exists for legacy references
const defaultRoot = path.join(uploadsRoot, "travels");
if (!fs.existsSync(defaultRoot)) fs.mkdirSync(defaultRoot, { recursive: true });

// Dynamic subfolder based on target (e.g., 'banks')
function resolveUploadRoot(req) {
  const target = (
    req.uploadTarget ||
    req.query.uploadTarget ||
    req.body.uploadTarget ||
    "travels"
  ).toString();
  return path.join(uploadsRoot, target);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const root = resolveUploadRoot(req);
    if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
    cb(null, root);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB limit

module.exports = upload;
