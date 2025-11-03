function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  const details = err.details;
  const payload = { message };
  if (details) payload.details = details;
  res.status(status).json(payload);
}

module.exports = { errorHandler };
