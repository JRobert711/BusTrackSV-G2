/**
 * GTFS Repositories Index
 *
 * Central export point for all GTFS repositories.
 */

const { agencyRepository } = require('./agencyRepository');
const { stopRepository } = require('./stopRepository');
const { routeRepository } = require('./routeRepository');
const { tripRepository } = require('./tripRepository');
const { stopTimeRepository } = require('./stopTimeRepository');

module.exports = {
  agencyRepository,
  stopRepository,
  routeRepository,
  tripRepository,
  stopTimeRepository
};

