/**
 * Bus Controller
 *
 * Handles bus management HTTP requests.
 * Returns uniform success/error envelopes.
 */

const busService = require('../services/busService');

/**
 * List buses with pagination and filters
 *
 * GET /api/v1/buses
 *
 * Query params:
 * - page: number (default: 1)
 * - pageSize: number (default: 10)
 * - route: string (filter by route)
 * - status: string (filter by status: parked, moving, maintenance)
 * - sort: string (default: 'createdAt')
 * - order: string (default: 'desc')
 *
 * Response 200:
 * {
 *   data: [...],
 *   pagination: { page, pageSize, total, totalPages, hasMore }
 * }
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function listBuses(req, res, next) {
  try {
    const { page, pageSize, route, status, sort, order } = req.query;

    const result = await busService.listBuses({
      page,
      pageSize,
      route,
      status,
      sort,
      order
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get bus by ID
 *
 * GET /api/v1/buses/:id
 *
 * Response 200:
 * {
 *   bus: { id, licensePlate, unitName, ... }
 * }
 *
 * Response 404: Bus not found
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getBusById(req, res, next) {
  try {
    const { id } = req.params;

    const bus = await busService.getBusById(id);

    return res.status(200).json({ bus });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new bus
 *
 * POST /api/v1/buses
 *
 * Request body:
 * {
 *   licensePlate: string (required, ≥3 chars),
 *   unitName: string (required),
 *   status: string (required: parked, moving, maintenance),
 *   route: string (optional),
 *   driver: string (optional),
 *   movingTime: number (optional, default: 0),
 *   parkedTime: number (optional, default: 0),
 *   isFavorite: boolean (optional, default: false),
 *   position: { lat, lng } (optional)
 * }
 *
 * Response 201:
 * {
 *   bus: { id, licensePlate, unitName, ... }
 * }
 *
 * Response 409: License plate already exists
 * Response 422: Validation failed
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function createBus(req, res, next) {
  try {
    const busData = req.body;

    const bus = await busService.createBus(busData);

    return res.status(201).json({ bus });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a bus
 *
 * PATCH /api/v1/buses/:id
 *
 * Request body: (all fields optional)
 * {
 *   licensePlate: string,
 *   unitName: string,
 *   status: string,
 *   route: string,
 *   driver: string,
 *   movingTime: number,
 *   parkedTime: number,
 *   isFavorite: boolean,
 *   position: { lat, lng }
 * }
 *
 * Response 200:
 * {
 *   bus: { id, licensePlate, unitName, ... }
 * }
 *
 * Response 404: Bus not found
 * Response 422: Validation failed
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function updateBus(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const bus = await busService.updateBus(id, updates);

    return res.status(200).json({ bus });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle favorite status
 *
 * PATCH /api/v1/buses/:id/favorite
 *
 * No request body required - toggles current favorite status
 *
 * Response 200:
 * {
 *   bus: { id, licensePlate, unitName, ..., isFavorite: true/false }
 * }
 *
 * Response 404: Bus not found
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;

    const bus = await busService.toggleFavorite(id);

    return res.status(200).json({ bus });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a bus
 *
 * DELETE /api/v1/buses/:id
 *
 * Response 204: No content (success)
 * Response 404: Bus not found
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function deleteBus(req, res, next) {
  try {
    const { id } = req.params;

    await busService.deleteBus(id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Update bus position
 *
 * PATCH /api/v1/buses/:id/position
 *
 * Request body:
 * {
 *   lat: number (-90 to 90),
 *   lng: number (-180 to 180)
 * }
 *
 * Response 200:
 * {
 *   bus: { id, ..., position: { lat, lng } }
 * }
 *
 * Response 404: Bus not found
 * Response 422: Invalid coordinates
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function updatePosition(req, res, next) {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const bus = await busService.updatePosition(id, lat, lng);

    return res.status(200).json({ bus });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBuses,
  getBusById,
  createBus,
  updateBus,
  toggleFavorite,
  deleteBus,
  updatePosition
};
