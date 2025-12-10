function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  const details = err.details;
  // Use 'error' field for consistency with frontend expectations
  const payload = { error: message };
  if (details) {
    payload.details = details;
  }
  // Also include 'message' for backward compatibility
  payload.message = message;
  res.status(status).json(payload);
}

module.exports = { errorHandler };
