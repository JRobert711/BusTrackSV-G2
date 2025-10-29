// Carga variables desde .env si existe y desde el entorno del sistema.
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'bustrack_secret_key_2024',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
