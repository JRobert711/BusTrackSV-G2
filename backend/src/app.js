const express = require('express');
const cors = require('cors');

const app = express();

// ============================================
// Middlewares
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check Route
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BusTrack SV API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'bustrack-sv-backend',
    version: '1.0.0'
  });
});

// ============================================
// API Routes (will be added later)
// ============================================
// app.use('/api/v1', apiRouter);

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, _next) => {
  console.error('Error:', err);

  // Default error response
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = err.name || 'Error';
  const response = { error: message, type: errorType };

  // Handle JWT errors
  if (err.name === 'TokenExpiredError' || err.type === 'TOKEN_EXPIRED') {
    status = 401;
    message = 'Token has expired. Please login again.';
    errorType = 'TOKEN_EXPIRED';
  } else if (err.name === 'TokenInvalidError' || err.type === 'TOKEN_INVALID') {
    status = 401;
    message = err.message || 'Invalid or malformed token';
    errorType = 'TOKEN_INVALID';
  } else if (err.name === 'JwtError') {
    status = 401;
    message = err.message;
    errorType = err.type || 'JWT_ERROR';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    errorType = 'VALIDATION_ERROR';
    if (err.field) {
      response.field = err.field;
    }
  }

  // Update response
  response.error = message;
  response.type = errorType;

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
});

module.exports = app;
