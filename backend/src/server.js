require('dotenv').config();

// Load configuration first
const config = require('./config/env');

// Initialize Firebase (will use stub mode if credentials are missing)
// The db.js module will return a stub admin object if credentials are not configured,
// allowing the server to run for frontend development without Firebase.
let _db = null;
let _admin = null;

try {
  const firebaseModule = require('./config/db');
  _db = firebaseModule.db;
  _admin = firebaseModule.admin;
  console.log('✓ Firebase module loaded');
} catch (error) {
  // Firebase initialization failed - log error but continue
  // The db.js module should handle this gracefully with stub mode
  console.error('⚠️  Firebase initialization warning:', error.message);
  console.warn('   Server will continue in stub mode. Some features may not work.');
}

const app = require('./app');

const PORT = config.port.PORT;
const HOST = config.server.HOST;
const NODE_ENV = config.env.NODE_ENV;

if (!PORT) {
  console.error('❌ Error: PORT environment variable is required');
  process.exit(1);
}

// ============================================
// Start Server
// ============================================
// Listen on configured network interface
const server = app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('🚀 BusTrack SV Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/v1`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/ - Health check`);
  console.log(`  GET  http://localhost:${PORT}/health - Detailed health`);
  console.log(`  POST http://localhost:${PORT}/api/v1/auth/login - Login`);
  console.log(`  GET  http://localhost:${PORT}/api/v1/buses - Get buses`);
  console.log('='.repeat(50));
  console.log('✅ Server is ready and listening for connections');
  console.log(`✅ Listening on ${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`✅ Accessible from: http://localhost:${PORT} or http://127.0.0.1:${PORT}`);
  } else {
    console.log(`✅ Accessible from: http://${HOST}:${PORT}`);
  }
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the other process or use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
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
