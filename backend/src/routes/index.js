const express = require('express');
const authRoutes = require('./auth.routes');
const busesRoutes = require('./buses.routes');
// GTFS: Uncomment to activate
// const gtfsRoutes = require('./gtfs.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/buses', busesRoutes);
// GTFS: Uncomment to activate
// router.use('/gtfs', gtfsRoutes);

module.exports = router;
