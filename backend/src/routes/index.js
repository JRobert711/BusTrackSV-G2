const express = require('express');
const authRoutes = require('./auth.routes');
const busesRoutes = require('./buses.routes');
const usersRoutes = require('./users.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busesRoutes);
router.use('/users', usersRoutes);

module.exports = router;
