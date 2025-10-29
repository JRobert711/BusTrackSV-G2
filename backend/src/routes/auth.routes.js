const express = require('express');
const { login } = require('../controllers/auth.controller');
const { validateLogin } = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/login', authLimiter, validateLogin, login);

module.exports = router;
