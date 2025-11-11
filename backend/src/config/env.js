// Carga variables desde .env si existe y desde el entorno del sistema.
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'bustrack_secret_key_2024',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};

/**
 * Parse comma-separated values into an array
 * @param {string} value - CSV string
 * @param {Array} defaultValue - Default value if parsing fails
 * @returns {Array} Parsed array
 */
function parseCSV(value, defaultValue = []) {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

// Build configuration object
const config = {
  // ============================================
  // Environment
  // ============================================
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_TEST: process.env.NODE_ENV === 'test'
  },

  // ============================================
  // Server Port
  // ============================================
  port: {
    PORT: parseInt(process.env.PORT, 10) || 5000
  },

  // ============================================
  // JWT Configuration
  // ============================================
  jwt: {
    JWT_SECRET: process.env.JWT_SECRET || 'change_me_in_production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change_me_refresh_in_production',
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // ============================================
  // CORS Configuration
  // ============================================
  cors: {
    CORS_ORIGIN: parseCSV(process.env.CORS_ORIGIN, ['http://localhost:5173']),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true'
  },

  // ============================================
  // Firebase Configuration
  // ============================================
  firebase: {
    // Base64-encoded service account JSON (preferred for production/deployment)
    FIREBASE_SERVICE_ACCOUNT_BASE64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || null,

    // Path to service account JSON file (useful for local development)
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,

    // Firebase Database URL (optional, depends on your Firebase setup)
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || null
  },

  // ============================================
  // GPS & Data Retention
  // ============================================
  gps: {
    GPS_RETENTION_DAYS: parseInt(process.env.GPS_RETENTION_DAYS, 10) || 30
  }
};

// Freeze the config object to prevent modifications at runtime
const frozenConfig = Object.freeze({
  ...config,
  env: Object.freeze(config.env),
  port: Object.freeze(config.port),
  jwt: Object.freeze(config.jwt),
  cors: Object.freeze(config.cors),
  firebase: Object.freeze(config.firebase),
  gps: Object.freeze(config.gps)
});

module.exports = frozenConfig;
