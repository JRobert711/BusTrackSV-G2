const express = require('express');
const authRoutes = require('./authRoutes');
const busRoutes = require('./busRoutes');
const usersRoutes = require('./users.routes');
const driversRoutes = require('./drivers.routes');
const notificationsRoutes = require('./notifications.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busRoutes);
router.use('/users', usersRoutes);
router.use('/drivers', driversRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
