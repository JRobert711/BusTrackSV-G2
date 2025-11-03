const express = require('express');
const authRoutes = require('./auth.routes');
const busesRoutes = require('./buses.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busesRoutes);

module.exports = router;
