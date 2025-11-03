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

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
