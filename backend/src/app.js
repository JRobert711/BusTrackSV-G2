const express = require('express');
const cors = require('cors');

const app = express();

// ============================================
// Global Middlewares (Order Matters!)
// ============================================
// 1. CORS - Allow cross-origin requests
app.use(cors());

// 2. Body Parsers - Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: Rate limiting is applied at route level (see authRoutes, busRoutes)
// This allows different limits per endpoint

// ============================================
// Health Check Routes (No auth required)
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

app.get('/ready', (req, res) => {
  // In a real application, check database connectivity,
  // external service availability, etc.
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API Routes (v1)
// ============================================
// Mount all route handlers under /api/v1 prefix
// Each route file applies its own:
// - Rate limiting (per endpoint)
// - Authentication middleware (where needed)
// - Validation middleware (Joi schemas)

const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const gpsRoutes = require('./routes/gps.routes');

// Authentication & Authorization
app.use('/api/v1/auth', authRoutes);

// Bus Management (CRUD + favorites + position)
app.use('/api/v1/buses', busRoutes);

// GPS Data Ingestion (Reserved - returns 501 Not Implemented)
app.use('/api/v1/gps', gpsRoutes);

// ============================================
// 404 Handler (Must come after all routes)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    type: 'NOT_FOUND'
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
