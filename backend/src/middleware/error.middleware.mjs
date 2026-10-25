// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    status,
    message
  });
};
