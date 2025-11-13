/**
 * GTFS Models Index
 *
 * Central export point for all GTFS domain models.
 * Based on GTFS Static specification.
 */

const Agency = require('./Agency');
const Stop = require('./Stop');
const Route = require('./Route');
const Trip = require('./Trip');
const StopTime = require('./StopTime');

module.exports = {
  Agency,
  Stop,
  Route,
  Trip,
  StopTime
};

