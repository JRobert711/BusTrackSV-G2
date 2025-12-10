/**
 * Bus Service
 *
 * Business logic for bus management.
 * Orchestrates between repositories and models.
 */

const { busRepository } = require('./busRepository');
const Bus = require('../models/Bus');

/**
 * BusService Class
 *
 * Handles bus CRUD operations and business logic.
 */
class BusService {
  /**
   * List buses with pagination and filters
   *
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=10] - Items per page
   * @param {string} [options.route] - Filter by route
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.sort='createdAt'] - Sort field
   * @param {string} [options.order='desc'] - Sort order (asc/desc)
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async listBuses(options = {}) {
    const {
      page = 1,
      pageSize = 10,
      route,
      status
      // sort = 'createdAt',
      // order = 'desc'
    } = options;

    // Build filters
    const filters = {};
    if (route) {
      filters.route = route;
    }
    if (status) {
      filters.status = status;
    }

    // Get buses from repository
    const result = await busRepository.list({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      filters
      // TODO: Add sorting when repository supports it
    });

    // Return data with pagination metadata
    return {
      data: result.buses.map(bus => bus.toJSON()),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore
      }
    };
  }

  /**
   * Get bus by ID
   *
   * @param {string} id - Bus ID
   * @returns {Promise<Object|null>}
   * @throws {Error} If bus not found (404)
   */
  async getBusById(id) {
    const bus = await busRepository.findById(id);

    if (!bus) {
      const error = new Error('Bus not found');
      error.status = 404;
      error.type = 'NOT_FOUND';
      throw error;
    }

    return bus.toJSON();
  }

  /**
   * Create a new bus
   *
   * @param {Object} busData - Bus data
   * @returns {Promise<Object>}
   */
  async createBus(busData) {
    // Create bus model (validation happens in constructor)
    const bus = new Bus({
      licensePlate: busData.licensePlate,
      unitName: busData.unitName,
      status: busData.status,
      route: busData.route || null,
      driver: busData.driver || null,
      movingTime: busData.movingTime || 0,
      parkedTime: busData.parkedTime || 0,
      isFavorite: busData.isFavorite || false,
      position: busData.position || null
    });

    // Save to database
    const createdBus = await busRepository.create(bus);

    return createdBus.toJSON();
  }

  /**
   * Update an existing bus
   *
   * @param {string} id - Bus ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   * @throws {Error} If bus not found (404)
   */
  async updateBus(id, updates) {
    // Get existing bus
    const existingBus = await busRepository.findById(id);

    if (!existingBus) {
      const error = new Error('Bus not found');
      error.status = 404;
      error.type = 'NOT_FOUND';
      throw error;
    }

    // Update fields
    if (updates.licensePlate !== undefined) {
      existingBus.licensePlate = updates.licensePlate;
    }
    if (updates.unitName !== undefined) {
      existingBus.unitName = updates.unitName;
    }
    if (updates.status !== undefined) {
      existingBus.status = updates.status;
    }
    if (updates.route !== undefined) {
      existingBus.route = updates.route;
    }
    if (updates.driver !== undefined) {
      existingBus.driver = updates.driver;
    }
    if (updates.movingTime !== undefined) {
      existingBus.movingTime = updates.movingTime;
    }
    if (updates.parkedTime !== undefined) {
      existingBus.parkedTime = updates.parkedTime;
    }
    if (updates.isFavorite !== undefined) {
      existingBus.isFavorite = updates.isFavorite;
    }
    if (updates.position !== undefined) {
      existingBus.position = updates.position;
    }

    // Save to database
    const updatedBus = await busRepository.update(existingBus);

    return updatedBus.toJSON();
  }

  /**
   * Toggle favorite status of a bus
   *
   * @param {string} id - Bus ID
   * @returns {Promise<Object>}
   * @throws {Error} If bus not found (404)
   */
  async toggleFavorite(id) {
    // Get existing bus
    const existingBus = await busRepository.findById(id);

    if (!existingBus) {
      const error = new Error('Bus not found');
      error.status = 404;
      error.type = 'NOT_FOUND';
      throw error;
    }

    // Toggle favorite
    existingBus.toggleFavorite();

    // Save to database
    const updatedBus = await busRepository.update(existingBus);

    return updatedBus.toJSON();
  }

  /**
   * Delete a bus
   *
   * @param {string} id - Bus ID
   * @returns {Promise<void>}
   * @throws {Error} If bus not found (404)
   */
  async deleteBus(id) {
    // Repository will throw 404 if not found
    await busRepository.remove(id);
  }

  /**
   * Update bus position
   *
   * @param {string} id - Bus ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>}
   * @throws {Error} If bus not found (404)
   */
  async updatePosition(id, lat, lng) {
    const updatedBus = await busRepository.updatePosition(id, lat, lng);
    return updatedBus.toJSON();
  }
}

// Export singleton instance
module.exports = new BusService();
