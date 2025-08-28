const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Prisma errors
  if (err.code === "P2002") {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  if (err.code === "P2025") {
    const message = "Record not found";
    error = { message, statusCode: 404 };
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
