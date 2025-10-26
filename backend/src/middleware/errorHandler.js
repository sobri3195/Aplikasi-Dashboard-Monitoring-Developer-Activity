const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  if (err.code === 'P2002') {
    error = new AppError('Duplicate field value entered', 400);
  }

  if (err.code === 'P2025') {
    error = new AppError('Record not found', 404);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};
