/*
 * GTFS Routes (Commented - Ready to activate)
 *
 * To activate:
 * 1. Uncomment all content in this file
 * 2. Uncomment gtfsRoutes lines in backend/src/routes/index.js
 */

/*
const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/auth.middleware');
const gtfsController = require('../controllers/gtfs/gtfs.controller');

const router = express.Router();

// ============================================
// AGENCIES ENDPOINTS
// ============================================

// List all agencies (public or authenticated)
router.get('/agencies', gtfsController.listAgencies);

// Get single agency
router.get('/agencies/:id', gtfsController.getAgency);

// Create agency (admin only)
router.post(
  '/agencies',
  authenticate,
  requireAdmin,
  gtfsController.createAgency
);

// Update agency (admin only)
router.patch(
  '/agencies/:id',
  authenticate,
  requireAdmin,
  gtfsController.updateAgency
);

// Delete agency (admin only)
router.delete(
  '/agencies/:id',
  authenticate,
  requireAdmin,
  gtfsController.deleteAgency
);

// ============================================
// STOPS ENDPOINTS
// ============================================

// List stops
router.get('/stops', gtfsController.listStops);

// Find nearby stops (geolocation query)
router.get('/stops/nearby', gtfsController.findNearbyStops);

// Get single stop
router.get('/stops/:id', gtfsController.getStop);

// Get stop times for a specific stop
router.get('/stops/:stopId/stop-times', gtfsController.getStopStopTimes);

// Create stop (admin only)
router.post(
  '/stops',
  authenticate,
  requireAdmin,
  gtfsController.createStop
);

// Update stop (admin only)
router.patch(
  '/stops/:id',
  authenticate,
  requireAdmin,
  gtfsController.updateStop
);

// Delete stop (admin only)
router.delete(
  '/stops/:id',
  authenticate,
  requireAdmin,
  gtfsController.deleteStop
);

// ============================================
// ROUTES ENDPOINTS
// ============================================

// List routes
router.get('/routes', gtfsController.listRoutes);

// Get single route
router.get('/routes/:id', gtfsController.getRoute);

// Create route (admin only)
router.post(
  '/routes',
  authenticate,
  requireAdmin,
  gtfsController.createRoute
);

// Update route (admin only)
router.patch(
  '/routes/:id',
  authenticate,
  requireAdmin,
  gtfsController.updateRoute
);

// Delete route (admin only)
router.delete(
  '/routes/:id',
  authenticate,
  requireAdmin,
  gtfsController.deleteRoute
);

// ============================================
// TRIPS ENDPOINTS
// ============================================

// List trips
router.get('/trips', gtfsController.listTrips);

// Get single trip
router.get('/trips/:id', gtfsController.getTrip);

// Get stop times for a specific trip
router.get('/trips/:tripId/stop-times', gtfsController.getTripStopTimes);

// Bulk create stop times for a trip (admin only)
router.post(
  '/trips/:tripId/stop-times/bulk',
  authenticate,
  requireAdmin,
  gtfsController.bulkCreateStopTimes
);

// Create trip (admin only)
router.post(
  '/trips',
  authenticate,
  requireAdmin,
  gtfsController.createTrip
);

// Update trip (admin only)
router.patch(
  '/trips/:id',
  authenticate,
  requireAdmin,
  gtfsController.updateTrip
);

// Delete trip (admin only)
router.delete(
  '/trips/:id',
  authenticate,
  requireAdmin,
  gtfsController.deleteTrip
);

// ============================================
// STOP TIMES ENDPOINTS
// ============================================

// Create stop time (admin only)
router.post(
  '/stop-times',
  authenticate,
  requireAdmin,
  gtfsController.createStopTime
);

module.exports = router;
*/

// Placeholder export to prevent import errors
module.exports = require('express').Router();

