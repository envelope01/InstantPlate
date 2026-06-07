const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: Don't leak sensitive database details to clients
    let error = { ...err };
    error.message = err.message;

    // Handle Prisma specific errors
    if (err.code === 'P2002') {
      // Unique constraint failed
      error = new AppError(`Duplicate field value entered. Please choose another value.`, 400);
    }

    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    } else {
      console.error('ERROR 💥:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong on our end.'
      });
    }
  }
};
