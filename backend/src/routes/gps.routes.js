/**
 * GPS Routes
 *
 * Reserved for future GPS data ingestion.
 * Currently returns 501 Not Implemented for all endpoints.
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * POST /api/v1/gps/ingest
 * Ingest GPS data from tracking device
 * 
 * RESERVED - NOT YET IMPLEMENTED
 * Returns 501 Not Implemented
 */
router.post('/ingest', authenticateToken, (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    type: 'NOT_IMPLEMENTED',
    message: 'GPS ingestion endpoint is reserved for future implementation',
    plannedFeatures: [
      'Deduplication by deviceId + timestamp',
      'Per-device rate limiting (~1 Hz)',
      'Data retention: 30 days (Firestore TTL)',
      'Real-time position updates'
    ],
    documentation: 'See README.md for implementation details'
  });
});

module.exports = router;
