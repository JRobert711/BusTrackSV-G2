/**
 * Bus Model
 *
 * OOP entity model with private fields, getters/setters, and validation.
 * Represents a bus in the BusTrack SV system.
 */

const { validateEnum, validateCoordinates } = require('../utils/validation');

/**
 * Allowed bus statuses
 */
const ALLOWED_STATUSES = ['parked', 'moving', 'maintenance'];

/**
 * Bus Class
 *
 * Encapsulates bus data with validation and business rules.
 * Uses private fields (#) for proper encapsulation.
 */
class Bus {
  // Private fields
  #id;
  #licensePlate;
  #unitName;
  #status;
  #route;
  #driver;
  #movingTime;
  #parkedTime;
  #isFavorite;
  #position;

  /**
   * Create a new Bus instance
   * @param {Object} data - Bus data
   * @param {string} data.id - Bus ID
   * @param {string} data.licensePlate - License plate (will be uppercased)
   * @param {string} data.unitName - Bus unit name
   * @param {string} data.status - Bus status (parked, moving, maintenance)
   * @param {string} [data.route] - Route identifier
   * @param {string} [data.driver] - Driver identifier
   * @param {number} [data.movingTime=0] - Time spent moving in seconds
   * @param {number} [data.parkedTime=0] - Time spent parked in seconds
   * @param {boolean} [data.isFavorite=false] - Whether bus is marked as favorite
   * @param {Object} [data.position] - GPS position (optional)
   * @param {number} [data.position.lat] - Latitude (-90 to 90)
   * @param {number} [data.position.lng] - Longitude (-180 to 180)
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Bus data must be a valid object');
    }

    // id is optional for new instances (Firestore will generate one).
    // Set private field directly when provided.
    if (data.id) {
      this.#id = String(data.id);
    }
    this.licensePlate = data.licensePlate;
    this.unitName = data.unitName;
    this.status = data.status;

    // Set optional fields
    this.route = data.route || null;
    this.driver = data.driver || null;
    this.movingTime = data.movingTime || 0;
    this.parkedTime = data.parkedTime || 0;
    this.isFavorite = data.isFavorite || false;

    // Set position (optional with validation)
    this.position = data.position || null;
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get bus ID
   * @returns {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * Get license plate (always uppercase)
   * @returns {string}
   */
  get licensePlate() {
    return this.#licensePlate;
  }

  /**
   * Get unit name
   * @returns {string}
   */
  get unitName() {
    return this.#unitName;
  }

  /**
   * Get bus status
   * @returns {string}
   */
  get status() {
    return this.#status;
  }

  /**
   * Get route identifier
   * @returns {string|null}
   */
  get route() {
    return this.#route;
  }

  /**
   * Get driver identifier
   * @returns {string|null}
   */
  get driver() {
    return this.#driver;
  }

  /**
   * Get moving time in seconds
   * @returns {number}
   */
  get movingTime() {
    return this.#movingTime;
  }

  /**
   * Get parked time in seconds
   * @returns {number}
   */
  get parkedTime() {
    return this.#parkedTime;
  }

  /**
   * Get favorite status
   * @returns {boolean}
   */
  get isFavorite() {
    return this.#isFavorite;
  }

  /**
   * Get GPS position
   * @returns {Object|null} Position with {lat, lng} or null
   */
  get position() {
    return this.#position;
  }

  // ============================================
  // Setters with Validation
  // ============================================

  /**
   * Set bus ID
   * @param {string} value - Bus ID
   */
  set id(value) {
    if (!value) {
      throw new Error('Bus ID is required');
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error('Bus ID must be a string or number');
    }
    this.#id = String(value);
  }

  /**
   * Set license plate (validates format and converts to uppercase)
   * @param {string} value - License plate
   */
  set licensePlate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('License plate is required and must be a string');
    }

    const upperPlate = value.trim().toUpperCase();

    if (upperPlate.length < 3) {
      throw new Error('License plate must be at least 3 characters long');
    }

    if (upperPlate.length > 20) {
      throw new Error('License plate must not exceed 20 characters');
    }

    this.#licensePlate = upperPlate;
  }

  /**
   * Set unit name
   * @param {string} value - Unit name
   */
  set unitName(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Unit name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 1) {
      throw new Error('Unit name cannot be empty');
    }

    if (trimmedName.length > 50) {
      throw new Error('Unit name must not exceed 50 characters');
    }

    this.#unitName = trimmedName;
  }

  /**
   * Set bus status (validates against allowed statuses)
   * @param {string} value - Bus status
   */
  set status(value) {
    if (!value) {
      throw new Error('Status is required');
    }

    // Validate status using validation utility
    try {
      validateEnum(value, ALLOWED_STATUSES, 'status');
    } catch (error) {
      throw new Error(`Invalid status: ${error.message}`);
    }

    this.#status = value;
  }

  /**
   * Set route identifier
   * @param {string|null} value - Route identifier
   */
  set route(value) {
    if (value === null || value === undefined) {
      this.#route = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Route must be a string or null');
    }

    this.#route = value.trim();
  }

  /**
   * Set driver identifier
   * @param {string|null} value - Driver identifier
   */
  set driver(value) {
    if (value === null || value === undefined) {
      this.#driver = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Driver must be a string or null');
    }

    this.#driver = value.trim();
  }

  /**
   * Set moving time in seconds
   * @param {number} value - Moving time
   */
  set movingTime(value) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new Error('Moving time must be a number');
    }

    if (num < 0) {
      throw new Error('Moving time cannot be negative');
    }

    this.#movingTime = num;
  }

  /**
   * Set parked time in seconds
   * @param {number} value - Parked time
   */
  set parkedTime(value) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new Error('Parked time must be a number');
    }

    if (num < 0) {
      throw new Error('Parked time cannot be negative');
    }

    this.#parkedTime = num;
  }

  /**
   * Set favorite status
   * @param {boolean} value - Favorite status
   */
  set isFavorite(value) {
    this.#isFavorite = Boolean(value);
  }

  /**
   * Set GPS position (optional, validates coordinates when provided)
   * @param {Object|null} value - Position with {lat, lng} or null
   */
  set position(value) {
    // Allow null/undefined for optional position
    if (value === null || value === undefined) {
      this.#position = null;
      return;
    }

    // Validate position is an object
    if (typeof value !== 'object') {
      throw new Error('Position must be an object with lat and lng properties');
    }

    // Extract coordinates
    const { lat, lng } = value;

    // Validate both coordinates are provided
    if (lat === undefined || lng === undefined) {
      throw new Error('Position must include both lat and lng properties');
    }

    // Validate coordinate types and ranges
    try {
      validateCoordinates(lat, lng);
    } catch (error) {
      throw new Error(`Invalid position coordinates: ${error.message}`);
    }

    // Store validated position
    this.#position = {
      lat: Number(lat),
      lng: Number(lng)
    };
  }

  // ============================================
  // Methods
  // ============================================

  /**
   * Check if bus is currently moving
   * @returns {boolean}
   */
  isMoving() {
    return this.#status === 'moving';
  }

  /**
   * Check if bus is parked
   * @returns {boolean}
   */
  isParked() {
    return this.#status === 'parked';
  }

  /**
   * Check if bus is in maintenance
   * @returns {boolean}
   */
  isInMaintenance() {
    return this.#status === 'maintenance';
  }

  /**
   * Check if bus has a position set
   * @returns {boolean}
   */
  hasPosition() {
    return this.#position !== null;
  }

  /**
   * Update bus position
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  updatePosition(lat, lng) {
    this.position = { lat, lng };
  }

  /**
   * Clear bus position
   */
  clearPosition() {
    this.#position = null;
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite() {
    this.#isFavorite = !this.#isFavorite;
  }

  /**
   * Convert bus to JSON (all public fields)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      licensePlate: this.#licensePlate,
      unitName: this.#unitName,
      status: this.#status,
      route: this.#route,
      driver: this.#driver,
      movingTime: this.#movingTime,
      parkedTime: this.#parkedTime,
      isFavorite: this.#isFavorite,
      position: this.#position
    };
  }

  /**
   * Convert bus to database object
   * @returns {Object}
   */
  toDatabase() {
    return this.toJSON();
  }

  /**
   * Create Bus instance from database document
   * @param {Object} doc - Database document
   * @returns {Bus}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create Bus from null/undefined document');
    }

    return new Bus({
      id: doc.id || doc._id,
      licensePlate: doc.licensePlate,
      unitName: doc.unitName,
      status: doc.status,
      route: doc.route,
      driver: doc.driver,
      movingTime: doc.movingTime,
      parkedTime: doc.parkedTime,
      isFavorite: doc.isFavorite,
      position: doc.position
    });
  }

  /**
   * Get the Firestore collection name for buses
   * @returns {string}
   */
  static collection() {
    return 'buses';
  }

  /**
   * Get allowed statuses
   * @returns {string[]}
   */
  static getAllowedStatuses() {
    return [...ALLOWED_STATUSES];
  }
}

module.exports = Bus;
