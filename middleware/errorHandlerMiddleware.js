const mongoose = require("mongoose");

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Log the error for debugging
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle specific error types
  switch (true) {
    // Mongoose Validation Error
    case err.name === "ValidationError":
      statusCode = 400;
      message = "Validation Error";
      errors = Object.values(err.errors).map((val) => ({
        field: val.path,
        message: val.message,
      }));
      break;

    // Mongoose Cast Error
    case err.name === "CastError":
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
      break;

    // Mongoose Duplicate Key Error
    case err.code === 11000:
      statusCode = 400;
      message = "Duplicate field value entered";
      errors = Object.keys(err.keyValue).map((key) => ({
        field: key,
        message: `${key} '${err.keyValue[key]}' already exists`,
      }));
      break;

    // JWT Errors
    case err.name === "JsonWebTokenError":
      statusCode = 401;
      message = "Invalid token";
      break;
    case err.name === "TokenExpiredError":
      statusCode = 401;
      message = "Token has expired";
      break;

    // MongoDB Connection Error
    case err.name === "MongoServerError":
      statusCode = 503;
      message = "Database connection error";
      break;

    // JSON Syntax Error (broadened to catch more cases)
    case err instanceof SyntaxError && err.message.includes("JSON"):
      statusCode = 400;
      message = "Invalid JSON payload";
      if (process.env.NODE_ENV !== "production") {
        errors = [{ details: err.message }]; // e.g., "Unexpected token , in JSON at position 64"
      }
      break;

    // Custom Application Error
    case err.isAppError:
      statusCode = err.statusCode || 400;
      message = err.message;
      errors = err.errors || null;
      break;

    // 404 Not Found
    case err.statusCode === 404:
      statusCode = 404;
      message = err.message || "Resource not found";
      break;

    // Default case
    default:
      if (process.env.NODE_ENV === "production") {
        message = "Internal Server Error";
      } else {
        errors = [{ stack: err.stack }];
      }
      statusCode = statusCode || 500;
      break;
  }

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== "production" &&
      statusCode === 500 && { stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};

module.exports = { errorMiddleware, asyncHandler };
