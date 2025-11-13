/**
 * Trip Model (GTFS Standard)
 *
 * Represents a specific journey of a vehicle along a route.
 * Based on GTFS trips.txt specification.
 * https://gtfs.org/schedule/reference/#tripstxt
 */

const { validateEnum } = require('../../utils/validation');

/**
 * Direction ID values
 * 0: Travel in one direction (e.g., outbound)
 * 1: Travel in the opposite direction (e.g., inbound)
 */
const DIRECTION_IDS = ['0', '1'];

/**
 * Wheelchair accessibility
 * 0 or blank: No information
 * 1: Accessible
 * 2: Not accessible
 */
const WHEELCHAIR_ACCESSIBLE = ['0', '1', '2'];

/**
 * Bikes allowed
 * 0 or blank: No information
 * 1: Allowed
 * 2: Not allowed
 */
const BIKES_ALLOWED = ['0', '1', '2'];

/**
 * Trip Class
 *
 * Encapsulates trip data with validation.
 * Maps to GTFS trips.txt file.
 */
class Trip {
  // Private fields
  #id;
  #routeId;
  #serviceId;
  #headsign;
  #shortName;
  #directionId;
  #blockId;
  #shapeId;
  #wheelchairAccessible;
  #bikesAllowed;
  #createdAt;
  #updatedAt;

  /**
   * Create a new Trip instance
   * @param {Object} data - Trip data
   * @param {string} data.id - Trip ID
   * @param {string} data.routeId - Route ID this trip belongs to
   * @param {string} data.serviceId - Service calendar ID
   * @param {string} [data.headsign] - Text that appears on signage (e.g., "Centro")
   * @param {string} [data.shortName] - Short name for trip (e.g., "Express 1")
   * @param {string} [data.directionId='0'] - Direction (0 or 1)
   * @param {string} [data.blockId] - Block/vehicle assignment ID
   * @param {string} [data.shapeId] - Shape ID for route geometry
   * @param {string} [data.wheelchairAccessible='0'] - Wheelchair accessibility (0-2)
   * @param {string} [data.bikesAllowed='0'] - Bikes allowed (0-2)
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Trip data must be a valid object');
    }

    if (data.id) {
      this.#id = String(data.id);
    }

    this.routeId = data.routeId;
    this.serviceId = data.serviceId;
    this.headsign = data.headsign || null;
    this.shortName = data.shortName || null;
    this.directionId = data.directionId || '0';
    this.blockId = data.blockId || null;
    this.shapeId = data.shapeId || null;
    this.wheelchairAccessible = data.wheelchairAccessible || '0';
    this.bikesAllowed = data.bikesAllowed || '0';

    // Set timestamps
    this.#createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.#updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // ============================================
  // Getters
  // ============================================

  get id() {
    return this.#id;
  }

  get routeId() {
    return this.#routeId;
  }

  get serviceId() {
    return this.#serviceId;
  }

  get headsign() {
    return this.#headsign;
  }

  get shortName() {
    return this.#shortName;
  }

  get directionId() {
    return this.#directionId;
  }

  get blockId() {
    return this.#blockId;
  }

  get shapeId() {
    return this.#shapeId;
  }

  get wheelchairAccessible() {
    return this.#wheelchairAccessible;
  }

  get bikesAllowed() {
    return this.#bikesAllowed;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  // ============================================
  // Setters with Validation
  // ============================================

  set id(value) {
    if (!value) {
      throw new Error('Trip ID is required');
    }
    this.#id = String(value);
  }

  set routeId(value) {
    if (!value) {
      throw new Error('Route ID is required');
    }
    this.#routeId = String(value);
  }

  set serviceId(value) {
    if (!value) {
      throw new Error('Service ID is required');
    }
    this.#serviceId = String(value);
  }

  set headsign(value) {
    if (value === null || value === undefined) {
      this.#headsign = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Trip headsign must be a string');
    }

    this.#headsign = value.trim();
  }

  set shortName(value) {
    if (value === null || value === undefined) {
      this.#shortName = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Trip short name must be a string');
    }

    this.#shortName = value.trim();
  }

  set directionId(value) {
    if (value === null || value === undefined) {
      this.#directionId = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, DIRECTION_IDS, 'direction_id');
    } catch (error) {
      throw new Error(`Invalid direction ID: ${error.message}`);
    }

    this.#directionId = stringValue;
  }

  set blockId(value) {
    if (value === null || value === undefined) {
      this.#blockId = null;
      return;
    }

    this.#blockId = String(value);
  }

  set shapeId(value) {
    if (value === null || value === undefined) {
      this.#shapeId = null;
      return;
    }

    this.#shapeId = String(value);
  }

  set wheelchairAccessible(value) {
    if (value === null || value === undefined) {
      this.#wheelchairAccessible = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, WHEELCHAIR_ACCESSIBLE, 'wheelchair_accessible');
    } catch (error) {
      throw new Error(`Invalid wheelchair accessible value: ${error.message}`);
    }

    this.#wheelchairAccessible = stringValue;
  }

  set bikesAllowed(value) {
    if (value === null || value === undefined) {
      this.#bikesAllowed = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, BIKES_ALLOWED, 'bikes_allowed');
    } catch (error) {
      throw new Error(`Invalid bikes allowed value: ${error.message}`);
    }

    this.#bikesAllowed = stringValue;
  }

  set createdAt(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid createdAt date');
    }
    this.#createdAt = date;
  }

  set updatedAt(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid updatedAt date');
    }
    this.#updatedAt = date;
  }

  // ============================================
  // Methods
  // ============================================

  /**
   * Update the updatedAt timestamp to current time
   */
  touch() {
    this.#updatedAt = new Date();
  }

  /**
   * Check if trip is wheelchair accessible
   * @returns {boolean}
   */
  isWheelchairAccessible() {
    return this.#wheelchairAccessible === '1';
  }

  /**
   * Check if bikes are allowed
   * @returns {boolean}
   */
  areBikesAllowed() {
    return this.#bikesAllowed === '1';
  }

  /**
   * Check if trip is outbound (direction 0)
   * @returns {boolean}
   */
  isOutbound() {
    return this.#directionId === '0';
  }

  /**
   * Check if trip is inbound (direction 1)
   * @returns {boolean}
   */
  isInbound() {
    return this.#directionId === '1';
  }

  /**
   * Convert trip to JSON (public fields only)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      routeId: this.#routeId,
      serviceId: this.#serviceId,
      headsign: this.#headsign,
      shortName: this.#shortName,
      directionId: this.#directionId,
      blockId: this.#blockId,
      shapeId: this.#shapeId,
      wheelchairAccessible: this.#wheelchairAccessible,
      bikesAllowed: this.#bikesAllowed,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert trip to database object
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      routeId: this.#routeId,
      serviceId: this.#serviceId,
      headsign: this.#headsign,
      shortName: this.#shortName,
      directionId: this.#directionId,
      blockId: this.#blockId,
      shapeId: this.#shapeId,
      wheelchairAccessible: this.#wheelchairAccessible,
      bikesAllowed: this.#bikesAllowed,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Convert trip to GTFS format (for trips.txt export)
   * @returns {Object}
   */
  toGTFS() {
    const gtfs = {
      trip_id: this.#id,
      route_id: this.#routeId,
      service_id: this.#serviceId
    };

    // Add optional fields if present
    if (this.#headsign) gtfs.trip_headsign = this.#headsign;
    if (this.#shortName) gtfs.trip_short_name = this.#shortName;
    if (this.#directionId !== '0') gtfs.direction_id = this.#directionId;
    if (this.#blockId) gtfs.block_id = this.#blockId;
    if (this.#shapeId) gtfs.shape_id = this.#shapeId;
    if (this.#wheelchairAccessible !== '0') gtfs.wheelchair_accessible = this.#wheelchairAccessible;
    if (this.#bikesAllowed !== '0') gtfs.bikes_allowed = this.#bikesAllowed;

    return gtfs;
  }

  /**
   * Create Trip instance from database document
   * @param {Object} doc - Database document
   * @returns {Trip}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create Trip from null/undefined document');
    }

    return new Trip({
      id: doc.id || doc._id,
      routeId: doc.routeId,
      serviceId: doc.serviceId,
      headsign: doc.headsign,
      shortName: doc.shortName,
      directionId: doc.directionId,
      blockId: doc.blockId,
      shapeId: doc.shapeId,
      wheelchairAccessible: doc.wheelchairAccessible,
      bikesAllowed: doc.bikesAllowed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Create Trip instance from GTFS data (trips.txt row)
   * @param {Object} gtfsRow - GTFS trips.txt row
   * @returns {Trip}
   */
  static fromGTFS(gtfsRow) {
    if (!gtfsRow) {
      throw new Error('Cannot create Trip from null/undefined GTFS row');
    }

    return new Trip({
      id: gtfsRow.trip_id,
      routeId: gtfsRow.route_id,
      serviceId: gtfsRow.service_id,
      headsign: gtfsRow.trip_headsign,
      shortName: gtfsRow.trip_short_name,
      directionId: gtfsRow.direction_id || '0',
      blockId: gtfsRow.block_id,
      shapeId: gtfsRow.shape_id,
      wheelchairAccessible: gtfsRow.wheelchair_accessible || '0',
      bikesAllowed: gtfsRow.bikes_allowed || '0'
    });
  }

  /**
   * Get the Firestore collection name for trips
   * @returns {string}
   */
  static collection() {
    return 'gtfs_trips';
  }

  /**
   * Get allowed direction IDs
   * @returns {string[]}
   */
  static getDirectionIds() {
    return [...DIRECTION_IDS];
  }

  /**
   * Get wheelchair accessible options
   * @returns {string[]}
   */
  static getWheelchairAccessibleOptions() {
    return [...WHEELCHAIR_ACCESSIBLE];
  }

  /**
   * Get bikes allowed options
   * @returns {string[]}
   */
  static getBikesAllowedOptions() {
    return [...BIKES_ALLOWED];
  }
}

module.exports = Trip;

