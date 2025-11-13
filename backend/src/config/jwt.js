const jwt = require('jsonwebtoken');
const config = require('./env');

function sign(payload) {
  return jwt.sign(payload, config.jwt.JWT_SECRET, { expiresIn: config.jwt.ACCESS_TOKEN_EXPIRES_IN });
}

function verify(token) {
  return jwt.verify(token, config.jwt.JWT_SECRET);
}

module.exports = { sign, verify };
