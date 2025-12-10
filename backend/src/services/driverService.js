/**
 * Driver Service
 *
 * Business layer for driver CRUD.
 */

const Driver = require('../models/Driver');
const { driverRepository } = require('./driverRepository');

class DriverService {
  async listDrivers(options = {}) {
    return driverRepository.list(options);
  }

  async getDriverById(id) {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    return driver;
  }

  async createDriver(data) {
    const driver = new Driver(data);
    const created = await driverRepository.create(driver);
    return created;
  }

  async updateDriver(id, updates) {
    const existing = await this.getDriverById(id);
    const merged = new Driver({
      ...existing.toJSON(),
      ...updates,
      id
    });
    merged.touch();
    return driverRepository.update(merged);
  }

  async deleteDriver(id) {
    await driverRepository.remove(id);
  }
}

module.exports = new DriverService();

