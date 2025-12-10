const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');

const router = express.Router();

const listQuerySchema = Joi.object({
  read: Joi.boolean().optional(),
  type: Joi.string().valid('notification', 'warning', 'alert').optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

const notificationBodySchema = Joi.object({
  type: Joi.string().valid('notification', 'warning', 'alert').required(),
  busId: Joi.string().allow(null, '').optional(),
  busPlate: Joi.string().allow(null, '').optional(),
  route: Joi.string().allow(null, '').optional(),
  fromUserId: Joi.string().allow(null, '').optional(),
  fromName: Joi.string().allow(null, '').optional(),
  fromRole: Joi.string().allow(null, '').optional(),
  content: Joi.string().min(3).required(),
  severity: Joi.string().valid('info', 'warning', 'critical').optional(),
  metadata: Joi.object().unknown(true).optional(),
  read: Joi.boolean().optional()
});

const readBodySchema = Joi.object({
  read: Joi.boolean().optional()
});

const idParamSchema = Joi.object({
  id: Joi.string().required()
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

router.get(
  '/',
  apiLimiter,
  authenticateToken,
  validateQuery(listQuerySchema),
  notificationController.listNotifications
);

router.post(
  '/',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateBody(notificationBodySchema),
  notificationController.createNotification
);

router.patch(
  '/:id/read',
  apiLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(readBodySchema),
  notificationController.markNotificationRead
);

router.delete(
  '/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  notificationController.deleteNotification
);

module.exports = router;

