const { CORS_ORIGIN } = require('./env');

const corsOptions = {
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
};

module.exports = { corsOptions };
