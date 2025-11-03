/**
 * JWT Utility Class
 *
 * Handles JWT token generation and verification for both access and refresh tokens.
 * Uses configuration from config/env.js for secrets and expiration times.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Custom JWT Error Classes for better error handling
 */
class JwtError extends Error {
  constructor(message, type = 'JWT_ERROR') {
    super(message);
    this.name = 'JwtError';
    this.type = type;
    this.status = 401;
  }
}

class TokenExpiredError extends JwtError {
  constructor(message = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

class TokenInvalidError extends JwtError {
  constructor(message = 'Token is invalid') {
    super(message, 'TOKEN_INVALID');
    this.name = 'TokenInvalidError';
  }
}

/**
 * JwtUtil Class - Handles all JWT operations
 */
class JwtUtil {
  constructor() {
    this.accessSecret = config.jwt.JWT_SECRET;
    this.refreshSecret = config.jwt.JWT_REFRESH_SECRET;
    this.accessTtl = config.jwt.ACCESS_TOKEN_EXPIRES_IN;
    this.refreshTtl = config.jwt.REFRESH_TOKEN_EXPIRES_IN;
    this.clockTolerance = 30; // 30 seconds clock tolerance
  }

  /**
   * Sign an access token
   * @param {Object} payload - The payload to encode in the token
   * @returns {string} Signed JWT access token
   */
  signAccess(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }

    try {
      return jwt.sign(payload, this.accessSecret, {
        expiresIn: this.accessTtl,
        issuer: 'bustrack-sv',
        audience: 'bustrack-api'
      });
    } catch (error) {
      throw new Error(`Failed to sign access token: ${error.message}`);
    }
  }

  /**
   * Sign a refresh token
   * @param {Object} payload - The payload to encode in the token
   * @returns {string} Signed JWT refresh token
   */
  signRefresh(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }

    try {
      return jwt.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshTtl,
        issuer: 'bustrack-sv',
        audience: 'bustrack-api'
      });
    } catch (error) {
      throw new Error(`Failed to sign refresh token: ${error.message}`);
    }
  }

  /**
   * Verify an access token
   * @param {string} token - The JWT access token to verify
   * @returns {Object} Decoded token payload
   * @throws {TokenExpiredError} If token has expired
   * @throws {TokenInvalidError} If token is invalid
   */
  verifyAccess(token) {
    if (!token || typeof token !== 'string') {
      throw new TokenInvalidError('Token must be a valid string');
    }

    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        clockTolerance: this.clockTolerance,
        issuer: 'bustrack-sv',
        audience: 'bustrack-api'
      });
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new TokenInvalidError('Access token is invalid or malformed');
      } else if (error.name === 'NotBeforeError') {
        throw new TokenInvalidError('Access token is not yet valid');
      }
      throw new TokenInvalidError(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Verify a refresh token
   * @param {string} token - The JWT refresh token to verify
   * @returns {Object} Decoded token payload
   * @throws {TokenExpiredError} If token has expired
   * @throws {TokenInvalidError} If token is invalid
   */
  verifyRefresh(token) {
    if (!token || typeof token !== 'string') {
      throw new TokenInvalidError('Token must be a valid string');
    }

    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        clockTolerance: this.clockTolerance,
        issuer: 'bustrack-sv',
        audience: 'bustrack-api'
      });
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError('Refresh token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new TokenInvalidError('Refresh token is invalid or malformed');
      } else if (error.name === 'NotBeforeError') {
        throw new TokenInvalidError('Refresh token is not yet valid');
      }
      throw new TokenInvalidError(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (useful for debugging)
   * @param {string} token - The JWT token to decode
   * @returns {Object|null} Decoded token or null if invalid
   */
  decode(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
const jwtUtil = new JwtUtil();

module.exports = {
  JwtUtil,
  jwtUtil,
  JwtError,
  TokenExpiredError,
  TokenInvalidError
};
