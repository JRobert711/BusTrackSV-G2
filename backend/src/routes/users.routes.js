/**
 * Users Routes
 *
 * User management endpoints with Joi validation and role-based access control.
 *
 * Permissions:
 * - supervisor: read only (list, get by id)
 * - admin: full CRUD
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const usersController = require('../controllers/users.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');

/**
 * Joi Validation Schemas
 */

// Query parameters for list users
const listQuerySchema = Joi.object({
  role: Joi.string().valid('admin', 'supervisor').optional().messages({
    'any.only': 'Role must be either admin or supervisor'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
    'number.base': 'Limit must be a number'
  })
});

// Create user schema
const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  name: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'supervisor').optional().messages({
    'any.only': 'Role must be either admin or supervisor'
  })
});

// Update user schema
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'string.empty': 'Name cannot be empty'
  }),
  role: Joi.string().valid('admin', 'supervisor').optional().messages({
    'any.only': 'Role must be either admin or supervisor'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// User ID parameter schema
const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  })
});

/**
 * Rate Limiters
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
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

// GET /users
// List all users with optional filters
// Auth: any authenticated user (supervisor or admin)
// Permissions: supervisor can read, admin can read
router.get(
  '/',
  apiLimiter,
  authenticateToken,
  validateQuery(listQuerySchema),
  usersController.listUsers
);

// GET /users/:id
// Get a single user by ID
// Auth: any authenticated user (supervisor or admin)
// Permissions: supervisor can read, admin can read
router.get(
  '/:id',
  apiLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  usersController.getUserById
);

// POST /users
// Create a new user
// Auth: admin only
// Permissions: admin only
router.post(
  '/',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateBody(createUserSchema),
  usersController.createUser
);

// PATCH /users/:id
// Update a user
// Auth: admin only
// Permissions: admin only
router.patch(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  usersController.updateUser
);

// DELETE /users/:id
// Delete a user
// Auth: admin only
// Permissions: admin only
router.delete(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  usersController.deleteUser
);

module.exports = router;

