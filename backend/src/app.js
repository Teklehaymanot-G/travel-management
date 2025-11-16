const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const travelRoutes = require("./routes/travels");
const homeRoute = require("./routes/home");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const bankRoutes = require("./routes/banks");
const documentRoutes = require("./routes/documents");
const commentRoutes = require("./routes/comments");
const couponRoutes = require("./routes/coupons");
const roleRoutes = require("./routes/roles"); // Add this line

// Import middleware
const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

// Initialize Prisma Client
const prisma = new PrismaClient();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Rate limiting (relaxed in development to avoid accidental 429 during rapid refresh/hot reload)
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // production hard cap per IP
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
} else {
  // In development, apply a much higher limit but still guard extreme abuse
  const devLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 2000, // practically unbounded for normal dev usage
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Too many requests in a short time (dev)",
      hint: "If you truly need load testing, disable the dev limiter or use production mode.",
    },
  });
  app.use(devLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/travels", authMiddleware, travelRoutes);
app.use("/api/home", homeRoute);
app.use("/api/bookings", authMiddleware, bookingRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/banks", authMiddleware, bankRoutes);
app.use("/api/documents", documentRoutes); // Updated - some routes are public
app.use("/api/comments", commentRoutes); // Updated - some routes are public
app.use("/api/roles", authMiddleware, roleRoutes); // Add this line
app.use("/api/coupons", couponRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
