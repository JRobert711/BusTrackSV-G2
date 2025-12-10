/**
 * Bus Routes
 *
 * Bus management endpoints with Joi validation and role-based access control.
 *
 * Permissions:
 * - supervisor: read + toggle favorite (no create/update/delete)
 * - admin: full CRUD
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const busController = require('../controllers/busController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');

/**
 * Joi Validation Schemas
 */

// Query parameters for list buses
const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  route: Joi.string().optional(),
  status: Joi.string().valid('parked', 'moving', 'maintenance').optional(),
  sort: Joi.string().valid('createdAt', 'licensePlate', 'unitName', 'status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// Position schema
const positionSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'number.base': 'Latitude must be a number',
    'any.required': 'Latitude is required'
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'number.base': 'Longitude must be a number',
    'any.required': 'Longitude is required'
  })
});

// Create bus schema
const createBusSchema = Joi.object({
  licensePlate: Joi.string().min(3).max(20).required().messages({
    'string.min': 'License plate must be at least 3 characters long',
    'string.max': 'License plate must not exceed 20 characters',
    'string.empty': 'License plate is required',
    'any.required': 'License plate is required'
  }),
  unitName: Joi.string().min(1).max(50).trim().required().messages({
    'string.min': 'Unit name cannot be empty',
    'string.max': 'Unit name must not exceed 50 characters',
    'string.empty': 'Unit name is required',
    'any.required': 'Unit name is required'
  }),
  status: Joi.string().valid('parked', 'moving', 'maintenance').required().messages({
    'any.only': 'Status must be one of: parked, moving, maintenance',
    'any.required': 'Status is required'
  }),
  route: Joi.string().allow(null, '').optional(),
  driver: Joi.string().allow(null, '').optional(),
  movingTime: Joi.number().min(0).default(0).messages({
    'number.min': 'Moving time cannot be negative',
    'number.base': 'Moving time must be a number'
  }),
  parkedTime: Joi.number().min(0).default(0).messages({
    'number.min': 'Parked time cannot be negative',
    'number.base': 'Parked time must be a number'
  }),
  isFavorite: Joi.boolean().default(false),
  position: positionSchema.optional().allow(null)
});

// Update bus schema (all fields optional)
const updateBusSchema = Joi.object({
  licensePlate: Joi.string().min(3).max(20).optional().messages({
    'string.min': 'License plate must be at least 3 characters long',
    'string.max': 'License plate must not exceed 20 characters'
  }),
  unitName: Joi.string().min(1).max(50).trim().optional().messages({
    'string.min': 'Unit name cannot be empty',
    'string.max': 'Unit name must not exceed 50 characters'
  }),
  status: Joi.string().valid('parked', 'moving', 'maintenance').optional().messages({
    'any.only': 'Status must be one of: parked, moving, maintenance'
  }),
  route: Joi.string().allow(null, '').optional(),
  driver: Joi.string().allow(null, '').optional(),
  movingTime: Joi.number().min(0).optional().messages({
    'number.min': 'Moving time cannot be negative',
    'number.base': 'Moving time must be a number'
  }),
  parkedTime: Joi.number().min(0).optional().messages({
    'number.min': 'Parked time cannot be negative',
    'number.base': 'Parked time must be a number'
  }),
  isFavorite: Joi.boolean().optional(),
  position: positionSchema.optional().allow(null)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Bus ID parameter schema
const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Bus ID is required',
    'any.required': 'Bus ID is required'
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

// GET /buses
// List all buses with pagination and filters
// Auth: any authenticated user (supervisor or admin)
// Permissions: supervisor can read, admin can read
router.get(
  '/',
  apiLimiter,
  authenticateToken,
  validateQuery(listQuerySchema),
  busController.listBuses
);

// GET /buses/:id
// Get a single bus by ID
// Auth: any authenticated user (supervisor or admin)
// Permissions: supervisor can read, admin can read
router.get(
  '/:id',
  apiLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  busController.getBusById
);

// POST /buses
// Create a new bus
// Auth: admin only
// Permissions: admin only (supervisor cannot create)
router.post(
  '/',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateBody(createBusSchema),
  busController.createBus
);

// PATCH /buses/:id
// Update a bus
// Auth: admin only
// Permissions: admin only (supervisor cannot update)
router.patch(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateBusSchema),
  busController.updateBus
);

// PATCH /buses/:id/favorite
// Toggle favorite status of a bus
// Auth: any authenticated user (supervisor or admin)
// Permissions: both supervisor and admin can toggle favorites
router.patch(
  '/:id/favorite',
  apiLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  busController.toggleFavorite
);

// DELETE /buses/:id
// Delete a bus
// Auth: admin only
// Permissions: admin only (supervisor cannot delete)
router.delete(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  busController.deleteBus
);

// PATCH /buses/:id/position
// Update bus GPS position
// Auth: admin only (typically used by tracking system)
// Permissions: admin only
router.patch(
  '/:id/position',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(positionSchema),
  busController.updatePosition
);

module.exports = router;
