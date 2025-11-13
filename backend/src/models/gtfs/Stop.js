/**
 * Stop Model (GTFS Standard)
 *
 * Represents a bus stop or station where vehicles pick up or drop off riders.
 * Based on GTFS stops.txt specification.
 * https://gtfs.org/schedule/reference/#stopstxt
 */

const { validateCoordinates, validateEnum, validateUrl } = require('../../utils/validation');

/**
 * Location types (GTFS standard)
 * 0 or blank: Stop/platform
 * 1: Station (physical structure)
 * 2: Entrance/exit
 * 3: Generic node
 * 4: Boarding area
 */
const LOCATION_TYPES = ['0', '1', '2', '3', '4'];

/**
 * Wheelchair accessibility
 * 0 or blank: No information
 * 1: Accessible
 * 2: Not accessible
 */
const WHEELCHAIR_BOARDING = ['0', '1', '2'];

/**
 * Stop Class
 *
 * Encapsulates bus stop data with validation.
 * Maps to GTFS stops.txt file.
 */
class Stop {
  // Private fields
  #id;
  #code;
  #name;
  #desc;
  #lat;
  #lng;
  #zoneId;
  #url;
  #locationType;
  #parentStation;
  #timezone;
  #wheelchairBoarding;
  #platformCode;
  #createdAt;
  #updatedAt;

  /**
   * Create a new Stop instance
   * @param {Object} data - Stop data
   * @param {string} data.id - Stop ID
   * @param {string} [data.code] - Short text/number for riders (e.g., "A1", "101")
   * @param {string} data.name - Stop name (e.g., "Terminal de Oriente")
   * @param {string} [data.desc] - Stop description
   * @param {number} data.lat - Latitude (-90 to 90)
   * @param {number} data.lng - Longitude (-180 to 180)
   * @param {string} [data.zoneId] - Fare zone ID
   * @param {string} [data.url] - URL with information about the stop
   * @param {string} [data.locationType='0'] - Type of location (0-4)
   * @param {string} [data.parentStation] - Parent station ID (if applicable)
   * @param {string} [data.timezone] - Timezone (if different from agency)
   * @param {string} [data.wheelchairBoarding='0'] - Wheelchair accessibility (0-2)
   * @param {string} [data.platformCode] - Platform identifier
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Stop data must be a valid object');
    }

    if (data.id) {
      this.#id = String(data.id);
    }

    this.code = data.code || null;
    this.name = data.name;
    this.desc = data.desc || null;
    this.lat = data.lat;
    this.lng = data.lng;
    this.zoneId = data.zoneId || null;
    this.url = data.url || null;
    this.locationType = data.locationType || '0';
    this.parentStation = data.parentStation || null;
    this.timezone = data.timezone || null;
    this.wheelchairBoarding = data.wheelchairBoarding || '0';
    this.platformCode = data.platformCode || null;

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

  get code() {
    return this.#code;
  }

  get name() {
    return this.#name;
  }

  get desc() {
    return this.#desc;
  }

  get lat() {
    return this.#lat;
  }

  get lng() {
    return this.#lng;
  }

  get zoneId() {
    return this.#zoneId;
  }

  get url() {
    return this.#url;
  }

  get locationType() {
    return this.#locationType;
  }

  get parentStation() {
    return this.#parentStation;
  }

  get timezone() {
    return this.#timezone;
  }

  get wheelchairBoarding() {
    return this.#wheelchairBoarding;
  }

  get platformCode() {
    return this.#platformCode;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  /**
   * Get position as {lat, lng} object
   * @returns {Object}
   */
  get position() {
    return {
      lat: this.#lat,
      lng: this.#lng
    };
  }

  // ============================================
  // Setters with Validation
  // ============================================

  set id(value) {
    if (!value) {
      throw new Error('Stop ID is required');
    }
    this.#id = String(value);
  }

  set code(value) {
    if (value === null || value === undefined) {
      this.#code = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Stop code must be a string');
    }

    this.#code = value.trim();
  }

  set name(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Stop name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 2) {
      throw new Error('Stop name must be at least 2 characters long');
    }

    if (trimmedName.length > 255) {
      throw new Error('Stop name must not exceed 255 characters');
    }

    this.#name = trimmedName;
  }

  set desc(value) {
    if (value === null || value === undefined) {
      this.#desc = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Stop description must be a string');
    }

    this.#desc = value.trim();
  }

  set lat(value) {
    const numLat = Number(value);

    if (isNaN(numLat)) {
      throw new Error('Latitude must be a number');
    }

    try {
      validateCoordinates(numLat, 0); // Validate latitude only
    } catch (error) {
      throw new Error(`Invalid latitude: ${error.message}`);
    }

    this.#lat = numLat;
  }

  set lng(value) {
    const numLng = Number(value);

    if (isNaN(numLng)) {
      throw new Error('Longitude must be a number');
    }

    try {
      validateCoordinates(0, numLng); // Validate longitude only
    } catch (error) {
      throw new Error(`Invalid longitude: ${error.message}`);
    }

    this.#lng = numLng;
  }

  set zoneId(value) {
    if (value === null || value === undefined) {
      this.#zoneId = null;
      return;
    }

    this.#zoneId = String(value);
  }

  set url(value) {
    if (value === null || value === undefined) {
      this.#url = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Stop URL must be a string');
    }

    try {
      validateUrl(value);
    } catch (error) {
      throw new Error(`Invalid stop URL: ${error.message}`);
    }

    this.#url = value.trim();
  }

  set locationType(value) {
    if (value === null || value === undefined) {
      this.#locationType = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, LOCATION_TYPES, 'location_type');
    } catch (error) {
      throw new Error(`Invalid location type: ${error.message}`);
    }

    this.#locationType = stringValue;
  }

  set parentStation(value) {
    if (value === null || value === undefined) {
      this.#parentStation = null;
      return;
    }

    this.#parentStation = String(value);
  }

  set timezone(value) {
    if (value === null || value === undefined) {
      this.#timezone = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Timezone must be a string');
    }

    this.#timezone = value.trim();
  }

  set wheelchairBoarding(value) {
    if (value === null || value === undefined) {
      this.#wheelchairBoarding = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, WHEELCHAIR_BOARDING, 'wheelchair_boarding');
    } catch (error) {
      throw new Error(`Invalid wheelchair boarding value: ${error.message}`);
    }

    this.#wheelchairBoarding = stringValue;
  }

  set platformCode(value) {
    if (value === null || value === undefined) {
      this.#platformCode = null;
      return;
    }

    this.#platformCode = String(value);
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
   * Check if stop is wheelchair accessible
   * @returns {boolean}
   */
  isWheelchairAccessible() {
    return this.#wheelchairBoarding === '1';
  }

  /**
   * Check if stop is a station
   * @returns {boolean}
   */
  isStation() {
    return this.#locationType === '1';
  }

  /**
   * Update stop position
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  updatePosition(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  /**
   * Convert stop to JSON (public fields only)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      code: this.#code,
      name: this.#name,
      desc: this.#desc,
      lat: this.#lat,
      lng: this.#lng,
      zoneId: this.#zoneId,
      url: this.#url,
      locationType: this.#locationType,
      parentStation: this.#parentStation,
      timezone: this.#timezone,
      wheelchairBoarding: this.#wheelchairBoarding,
      platformCode: this.#platformCode,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert stop to database object
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      code: this.#code,
      name: this.#name,
      desc: this.#desc,
      lat: this.#lat,
      lng: this.#lng,
      zoneId: this.#zoneId,
      url: this.#url,
      locationType: this.#locationType,
      parentStation: this.#parentStation,
      timezone: this.#timezone,
      wheelchairBoarding: this.#wheelchairBoarding,
      platformCode: this.#platformCode,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Convert stop to GTFS format (for stops.txt export)
   * @returns {Object}
   */
  toGTFS() {
    const gtfs = {
      stop_id: this.#id,
      stop_name: this.#name,
      stop_lat: this.#lat,
      stop_lon: this.#lng
    };

    // Add optional fields if present
    if (this.#code) gtfs.stop_code = this.#code;
    if (this.#desc) gtfs.stop_desc = this.#desc;
    if (this.#zoneId) gtfs.zone_id = this.#zoneId;
    if (this.#url) gtfs.stop_url = this.#url;
    if (this.#locationType !== '0') gtfs.location_type = this.#locationType;
    if (this.#parentStation) gtfs.parent_station = this.#parentStation;
    if (this.#timezone) gtfs.stop_timezone = this.#timezone;
    if (this.#wheelchairBoarding !== '0') gtfs.wheelchair_boarding = this.#wheelchairBoarding;
    if (this.#platformCode) gtfs.platform_code = this.#platformCode;

    return gtfs;
  }

  /**
   * Create Stop instance from database document
   * @param {Object} doc - Database document
   * @returns {Stop}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create Stop from null/undefined document');
    }

    return new Stop({
      id: doc.id || doc._id,
      code: doc.code,
      name: doc.name,
      desc: doc.desc,
      lat: doc.lat,
      lng: doc.lng,
      zoneId: doc.zoneId,
      url: doc.url,
      locationType: doc.locationType,
      parentStation: doc.parentStation,
      timezone: doc.timezone,
      wheelchairBoarding: doc.wheelchairBoarding,
      platformCode: doc.platformCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Create Stop instance from GTFS data (stops.txt row)
   * @param {Object} gtfsRow - GTFS stops.txt row
   * @returns {Stop}
   */
  static fromGTFS(gtfsRow) {
    if (!gtfsRow) {
      throw new Error('Cannot create Stop from null/undefined GTFS row');
    }

    return new Stop({
      id: gtfsRow.stop_id,
      code: gtfsRow.stop_code,
      name: gtfsRow.stop_name,
      desc: gtfsRow.stop_desc,
      lat: gtfsRow.stop_lat,
      lng: gtfsRow.stop_lon,
      zoneId: gtfsRow.zone_id,
      url: gtfsRow.stop_url,
      locationType: gtfsRow.location_type || '0',
      parentStation: gtfsRow.parent_station,
      timezone: gtfsRow.stop_timezone,
      wheelchairBoarding: gtfsRow.wheelchair_boarding || '0',
      platformCode: gtfsRow.platform_code
    });
  }

  /**
   * Get the Firestore collection name for stops
   * @returns {string}
   */
  static collection() {
    return 'gtfs_stops';
  }

  /**
   * Get allowed location types
   * @returns {string[]}
   */
  static getLocationTypes() {
    return [...LOCATION_TYPES];
  }

  /**
   * Get wheelchair boarding options
   * @returns {string[]}
   */
  static getWheelchairBoardingOptions() {
    return [...WHEELCHAIR_BOARDING];
  }
}

module.exports = Stop;

