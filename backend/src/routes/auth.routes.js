const express = require('express');
const authController = require('../controllers/authController');
const { validateLogin } = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/register', authLimiter, authController.register);

module.exports = router;
