const { ZodError } = require('zod');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, name: err.name });

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const issues = err.issues || err.errors || [];
    const formattedErrors = issues.map(e => ({
      path: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: formattedErrors.length > 0 ? formattedErrors.map(e => e.message).join(', ') : 'Validation Error',
      errors: formattedErrors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. Please use another value.`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Mongoose Validation Error (fallback)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: errors.length > 0 ? errors.join(', ') : 'Database Validation Error',
      errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Default Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
