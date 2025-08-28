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
const documentRoutes = require("./routes/documents");
const commentRoutes = require("./routes/comments");
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
app.use("/api/documents", documentRoutes); // Updated - some routes are public
app.use("/api/comments", commentRoutes); // Updated - some routes are public
app.use("/api/roles", authMiddleware, roleRoutes); // Add this line

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
