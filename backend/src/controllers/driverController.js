const driverService = require('../services/driverService');

async function listDrivers(req, res, next) {
  try {
    const { status, assignedBus } = req.query;
    const drivers = await driverService.listDrivers({ status, assignedBus });
    res.status(200).json({ data: drivers.map(d => d.toJSON()) });
  } catch (error) {
    next(error);
  }
}

async function getDriverById(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await driverService.getDriverById(id);
    res.status(200).json({ driver: driver.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function createDriver(req, res, next) {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json({ driver: driver.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await driverService.updateDriver(id, req.body);
    res.status(200).json({ driver: driver.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const { id } = req.params;
    await driverService.deleteDriver(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};

