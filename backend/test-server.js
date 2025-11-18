// Simple test to verify server can start
require('dotenv').config();

console.log('Testing server startup...');
console.log('PORT:', process.env.PORT || 5000);

try {
  const config = require('./src/config/env');
  console.log('✓ Config loaded');
  console.log('  Port:', config.port.PORT);
  console.log('  Environment:', config.env.NODE_ENV);
  
  // Test Firebase initialization
  try {
    const firebaseModule = require('./src/config/db');
    console.log('✓ Firebase module loaded (may be in stub mode)');
  } catch (error) {
    console.warn('⚠️  Firebase module error (will use stub):', error.message);
  }
  
  // Test app loading
  const app = require('./src/app');
  console.log('✓ App loaded');
  
  console.log('\n✅ All modules loaded successfully!');
  console.log('You can now start the server with: npm start');
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  console.error(error.stack);
  process.exit(1);
}

