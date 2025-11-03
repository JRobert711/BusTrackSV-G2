/**
 * Auth Routes
 *
 * Authentication endpoints with Joi validation and rate limiting.
 * All responses follow uniform success/error envelopes.
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { PASSWORD_REGEX } = require('../utils/validation');

/**
 * Joi Validation Schemas
 */

// Register schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'string.empty': 'Name is required',
      'any.required': 'Name is required'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (!@#$%^&*)',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('admin', 'supervisor')
    .optional()
    .messages({
      'any.only': 'Role must be either admin or supervisor'
    })
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

// Refresh token schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
});

/**
 * Validation Middleware Factory
 *
 * Creates middleware that validates request body against Joi schema.
 * Returns 422 with per-field details on validation failure.
 *
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      // Format validation errors with per-field details
      const errors = {};
      error.details.forEach(detail => {
        const field = detail.path[0];
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      return res.status(422).json({
        error: 'Validation failed',
        type: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
}

/**
 * Rate Limiters
 */

// Login rate limiter - strict per-IP limit with success skip
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    type: 'RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again after 15 minutes',
      type: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Register rate limiter - less strict
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many registration attempts from this IP, please try again after 1 hour',
      type: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      type: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Routes
 */

// POST /auth/register
// Public - anyone can register (can be restricted later)
// Rate limited: 3 per hour per IP
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register
);

// POST /auth/login
// Public - anyone can attempt login
// Rate limited: 5 failed attempts per 15 minutes per IP (success doesn't count)
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login
);

// POST /auth/refresh
// Public - refresh access token
// Rate limited: general API limit
router.post(
  '/refresh',
  apiLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken
);

// GET /auth/me
// Protected - requires authentication
// Rate limited: general API limit
router.get(
  '/me',
  apiLimiter,
  authenticateToken,
  authController.getProfile
);

module.exports = router;
