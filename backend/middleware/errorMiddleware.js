function errorHandler(err, req, res, next) {
  console.error('API Error:', err.message || err);

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  let message = err.message || 'An unexpected server error occurred. Please try again.';

  // Avoid leaking raw internal DB/runtime errors
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error occurred.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || 'SERVER_ERROR'
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
