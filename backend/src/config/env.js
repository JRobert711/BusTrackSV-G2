// No usamos dotenv para mantener cero dependencias nuevas.
// Lee variables del entorno y ofrece defaults seguros para dev.

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'bustrack_secret_key_2024',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
