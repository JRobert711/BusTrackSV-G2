require('dotenv').config();

// Load configuration first
const config = require('./config/env');

// Initialize Firebase (will fail fast if credentials are missing)
// If you want to test the server without Firebase temporarily,
// comment out the line below. See FIREBASE_SETUP.md for details.
let _db = null;
let _admin = null;

try {
  const firebaseModule = require('./config/db');
  _db = firebaseModule.db;
  _admin = firebaseModule.admin;
} catch (error) {
  // Firebase initialization failed - error already logged in db.js
  process.exit(1);
}

const app = require('./app');

const PORT = config.port.PORT;
const NODE_ENV = config.env.NODE_ENV;

// ============================================
// Start Server
// ============================================
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 BusTrack SV Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`  GET  ${PORT === 80 ? '' : `http://localhost:${PORT}`}/ - Health check`);
  console.log(`  GET  ${PORT === 80 ? '' : `http://localhost:${PORT}`}/health - Detailed health`);
  console.log('='.repeat(50));
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// ============================================
// Unhandled Errors
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});
