const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && err.stack && !err.isOperational
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = errorHandler;
