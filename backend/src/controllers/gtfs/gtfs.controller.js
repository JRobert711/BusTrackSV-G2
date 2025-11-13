/**
 * GTFS Controller
 *
 * Handles HTTP requests/responses for GTFS entities.
 * Thin layer - delegates business logic to repositories.
 */

const {
  agencyRepository,
  stopRepository,
  routeRepository,
  tripRepository,
  stopTimeRepository
} = require('../../services/gtfs');

// ============================================
// AGENCIES
// ============================================

/**
 * List all agencies
 * GET /api/v1/gtfs/agencies
 */
async function listAgencies(req, res, next) {
  try {
    const agencies = await agencyRepository.list();
    
    res.status(200).json({
      data: agencies.map(agency => agency.toJSON()),
      count: agencies.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get agency by ID
 * GET /api/v1/gtfs/agencies/:id
 */
async function getAgency(req, res, next) {
  try {
    const { id } = req.params;
    const agency = await agencyRepository.findById(id);

    if (!agency) {
      return res.status(404).json({
        error: 'Agency not found',
        type: 'NOT_FOUND'
      });
    }

    res.status(200).json(agency.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Create agency
 * POST /api/v1/gtfs/agencies
 */
async function createAgency(req, res, next) {
  try {
    const { Agency } = require('../../models/gtfs');
    const agency = new Agency(req.body);
    const created = await agencyRepository.create(agency);

    res.status(201).json(created.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Update agency
 * PATCH /api/v1/gtfs/agencies/:id
 */
async function updateAgency(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await agencyRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        error: 'Agency not found',
        type: 'NOT_FOUND'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'id') {
        existing[key] = req.body[key];
      }
    });

    const updated = await agencyRepository.update(existing);
    res.status(200).json(updated.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Delete agency
 * DELETE /api/v1/gtfs/agencies/:id
 */
async function deleteAgency(req, res, next) {
  try {
    const { id } = req.params;
    await agencyRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ============================================
// STOPS
// ============================================

/**
 * List stops
 * GET /api/v1/gtfs/stops
 */
async function listStops(req, res, next) {
  try {
    const { locationType, parentStation, limit } = req.query;
    
    const options = {
      locationType,
      parentStation,
      limit: limit ? parseInt(limit) : 100
    };

    const stops = await stopRepository.list(options);
    
    res.status(200).json({
      data: stops.map(stop => stop.toJSON()),
      count: stops.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get stop by ID
 * GET /api/v1/gtfs/stops/:id
 */
async function getStop(req, res, next) {
  try {
    const { id } = req.params;
    const stop = await stopRepository.findById(id);

    if (!stop) {
      return res.status(404).json({
        error: 'Stop not found',
        type: 'NOT_FOUND'
      });
    }

    res.status(200).json(stop.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Find nearby stops
 * GET /api/v1/gtfs/stops/nearby?lat=13.6929&lng=-89.2182&radius=1
 */
async function findNearbyStops(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude and longitude are required',
        type: 'VALIDATION_ERROR'
      });
    }

    const radiusKm = radius ? parseFloat(radius) : 1;
    const stops = await stopRepository.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radiusKm
    );

    res.status(200).json({
      data: stops.map(stop => stop.toJSON()),
      count: stops.length,
      query: { lat: parseFloat(lat), lng: parseFloat(lng), radiusKm }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create stop
 * POST /api/v1/gtfs/stops
 */
async function createStop(req, res, next) {
  try {
    const { Stop } = require('../../models/gtfs');
    const stop = new Stop(req.body);
    const created = await stopRepository.create(stop);

    res.status(201).json(created.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Update stop
 * PATCH /api/v1/gtfs/stops/:id
 */
async function updateStop(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await stopRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        error: 'Stop not found',
        type: 'NOT_FOUND'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'id') {
        existing[key] = req.body[key];
      }
    });

    const updated = await stopRepository.update(existing);
    res.status(200).json(updated.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Delete stop
 * DELETE /api/v1/gtfs/stops/:id
 */
async function deleteStop(req, res, next) {
  try {
    const { id } = req.params;
    await stopRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * List routes
 * GET /api/v1/gtfs/routes
 */
async function listRoutes(req, res, next) {
  try {
    const { type, agencyId, limit } = req.query;
    
    const options = {
      type,
      agencyId,
      orderBy: 'sortOrder',
      limit: limit ? parseInt(limit) : 100
    };

    const routes = await routeRepository.list(options);
    
    res.status(200).json({
      data: routes.map(route => route.toJSON()),
      count: routes.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get route by ID
 * GET /api/v1/gtfs/routes/:id
 */
async function getRoute(req, res, next) {
  try {
    const { id } = req.params;
    const route = await routeRepository.findById(id);

    if (!route) {
      return res.status(404).json({
        error: 'Route not found',
        type: 'NOT_FOUND'
      });
    }

    res.status(200).json(route.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Create route
 * POST /api/v1/gtfs/routes
 */
async function createRoute(req, res, next) {
  try {
    const { Route } = require('../../models/gtfs');
    const route = new Route(req.body);
    const created = await routeRepository.create(route);

    res.status(201).json(created.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Update route
 * PATCH /api/v1/gtfs/routes/:id
 */
async function updateRoute(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await routeRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        error: 'Route not found',
        type: 'NOT_FOUND'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'id') {
        existing[key] = req.body[key];
      }
    });

    const updated = await routeRepository.update(existing);
    res.status(200).json(updated.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Delete route
 * DELETE /api/v1/gtfs/routes/:id
 */
async function deleteRoute(req, res, next) {
  try {
    const { id } = req.params;
    await routeRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ============================================
// TRIPS
// ============================================

/**
 * List trips
 * GET /api/v1/gtfs/trips
 */
async function listTrips(req, res, next) {
  try {
    const { routeId, serviceId, directionId, limit } = req.query;
    
    const options = {
      routeId,
      serviceId,
      directionId,
      limit: limit ? parseInt(limit) : 100
    };

    const trips = await tripRepository.list(options);
    
    res.status(200).json({
      data: trips.map(trip => trip.toJSON()),
      count: trips.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get trip by ID
 * GET /api/v1/gtfs/trips/:id
 */
async function getTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        type: 'NOT_FOUND'
      });
    }

    res.status(200).json(trip.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Create trip
 * POST /api/v1/gtfs/trips
 */
async function createTrip(req, res, next) {
  try {
    const { Trip } = require('../../models/gtfs');
    const trip = new Trip(req.body);
    const created = await tripRepository.create(trip);

    res.status(201).json(created.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Update trip
 * PATCH /api/v1/gtfs/trips/:id
 */
async function updateTrip(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await tripRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        error: 'Trip not found',
        type: 'NOT_FOUND'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'id') {
        existing[key] = req.body[key];
      }
    });

    const updated = await tripRepository.update(existing);
    res.status(200).json(updated.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Delete trip
 * DELETE /api/v1/gtfs/trips/:id
 */
async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    await tripRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ============================================
// STOP TIMES
// ============================================

/**
 * Get stop times for a trip
 * GET /api/v1/gtfs/trips/:tripId/stop-times
 */
async function getTripStopTimes(req, res, next) {
  try {
    const { tripId } = req.params;
    const stopTimes = await stopTimeRepository.findByTrip(tripId);

    res.status(200).json({
      data: stopTimes.map(st => st.toJSON()),
      count: stopTimes.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get stop times for a stop
 * GET /api/v1/gtfs/stops/:stopId/stop-times
 */
async function getStopStopTimes(req, res, next) {
  try {
    const { stopId } = req.params;
    const stopTimes = await stopTimeRepository.findByStop(stopId);

    res.status(200).json({
      data: stopTimes.map(st => st.toJSON()),
      count: stopTimes.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create stop time
 * POST /api/v1/gtfs/stop-times
 */
async function createStopTime(req, res, next) {
  try {
    const { StopTime } = require('../../models/gtfs');
    const stopTime = new StopTime(req.body);
    const created = await stopTimeRepository.create(stopTime);

    res.status(201).json(created.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk create stop times for a trip
 * POST /api/v1/gtfs/trips/:tripId/stop-times/bulk
 */
async function bulkCreateStopTimes(req, res, next) {
  try {
    const { tripId } = req.params;
    const { stopTimes } = req.body;

    if (!Array.isArray(stopTimes)) {
      return res.status(400).json({
        error: 'stopTimes must be an array',
        type: 'VALIDATION_ERROR'
      });
    }

    const { StopTime } = require('../../models/gtfs');
    const stopTimeModels = stopTimes.map(st => 
      new StopTime({ ...st, tripId })
    );

    const created = await stopTimeRepository.bulkCreate(stopTimeModels);

    res.status(201).json({
      data: created.map(st => st.toJSON()),
      count: created.length
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  // Agencies
  listAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,

  // Stops
  listStops,
  getStop,
  findNearbyStops,
  createStop,
  updateStop,
  deleteStop,

  // Routes
  listRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,

  // Trips
  listTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,

  // Stop Times
  getTripStopTimes,
  getStopStopTimes,
  createStopTime,
  bulkCreateStopTimes
};

