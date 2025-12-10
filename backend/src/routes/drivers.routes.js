const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const driverController = require('../controllers/driverController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');

const router = express.Router();

const listQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'on_leave').optional(),
  assignedBus: Joi.string().optional()
});

const driverBodySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().allow('', null).optional(),
  licenseNumber: Joi.string().min(3).max(50).required(),
  status: Joi.string().valid('active', 'inactive', 'on_leave').optional(),
  experience: Joi.number().integer().min(0).optional(),
  assignedBus: Joi.string().allow(null, '').optional()
});

const driverUpdateSchema = driverBodySchema.fork(
  ['name', 'licenseNumber'],
  schema => schema.optional()
).min(1);

const idParamSchema = Joi.object({
  id: Joi.string().required()
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

router.get(
  '/',
  apiLimiter,
  authenticateToken,
  validateQuery(listQuerySchema),
  driverController.listDrivers
);

router.get(
  '/:id',
  apiLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  driverController.getDriverById
);

router.post(
  '/',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateBody(driverBodySchema),
  driverController.createDriver
);

router.patch(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(driverUpdateSchema),
  driverController.updateDriver
);

router.delete(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  driverController.deleteDriver
);

module.exports = router;

