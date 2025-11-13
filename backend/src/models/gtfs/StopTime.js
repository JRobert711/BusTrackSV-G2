/**
 * StopTime Model (GTFS Standard)
 *
 * Represents arrival and departure times for a trip at a specific stop.
 * Based on GTFS stop_times.txt specification.
 * https://gtfs.org/schedule/reference/#stop_timestxt
 */

const { validateEnum } = require('../../utils/validation');

/**
 * Pickup types
 * 0 or blank: Regularly scheduled pickup
 * 1: No pickup available
 * 2: Must phone agency to arrange pickup
 * 3: Must coordinate with driver to arrange pickup
 */
const PICKUP_TYPES = ['0', '1', '2', '3'];

/**
 * Drop-off types
 * 0 or blank: Regularly scheduled drop-off
 * 1: No drop-off available
 * 2: Must phone agency to arrange drop-off
 * 3: Must coordinate with driver to arrange drop-off
 */
const DROP_OFF_TYPES = ['0', '1', '2', '3'];

/**
 * Timepoint values
 * 0: Times are considered approximate
 * 1 or blank: Times are considered exact
 */
const TIMEPOINT_VALUES = ['0', '1'];

/**
 * StopTime Class
 *
 * Encapsulates stop time data with validation.
 * Maps to GTFS stop_times.txt file.
 */
class StopTime {
  // Private fields
  #id;
  #tripId;
  #arrivalTime;
  #departureTime;
  #stopId;
  #stopSequence;
  #stopHeadsign;
  #pickupType;
  #dropOffType;
  #shapeDistTraveled;
  #timepoint;
  #createdAt;
  #updatedAt;

  /**
   * Create a new StopTime instance
   * @param {Object} data - StopTime data
   * @param {string} [data.id] - StopTime ID (auto-generated in Firestore)
   * @param {string} data.tripId - Trip ID
   * @param {string} data.arrivalTime - Arrival time (HH:MM:SS, can exceed 24:00:00)
   * @param {string} data.departureTime - Departure time (HH:MM:SS)
   * @param {string} data.stopId - Stop ID
   * @param {number} data.stopSequence - Order of stop in trip (starting at 0 or 1)
   * @param {string} [data.stopHeadsign] - Headsign for this specific stop
   * @param {string} [data.pickupType='0'] - Pickup type (0-3)
   * @param {string} [data.dropOffType='0'] - Drop-off type (0-3)
   * @param {number} [data.shapeDistTraveled] - Distance from start of shape
   * @param {string} [data.timepoint='1'] - Whether times are exact (0-1)
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('StopTime data must be a valid object');
    }

    if (data.id) {
      this.#id = String(data.id);
    }

    this.tripId = data.tripId;
    this.arrivalTime = data.arrivalTime;
    this.departureTime = data.departureTime;
    this.stopId = data.stopId;
    this.stopSequence = data.stopSequence;
    this.stopHeadsign = data.stopHeadsign || null;
    this.pickupType = data.pickupType || '0';
    this.dropOffType = data.dropOffType || '0';
    this.shapeDistTraveled = data.shapeDistTraveled || null;
    this.timepoint = data.timepoint || '1';

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

  get tripId() {
    return this.#tripId;
  }

  get arrivalTime() {
    return this.#arrivalTime;
  }

  get departureTime() {
    return this.#departureTime;
  }

  get stopId() {
    return this.#stopId;
  }

  get stopSequence() {
    return this.#stopSequence;
  }

  get stopHeadsign() {
    return this.#stopHeadsign;
  }

  get pickupType() {
    return this.#pickupType;
  }

  get dropOffType() {
    return this.#dropOffType;
  }

  get shapeDistTraveled() {
    return this.#shapeDistTraveled;
  }

  get timepoint() {
    return this.#timepoint;
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
      throw new Error('StopTime ID is required');
    }
    this.#id = String(value);
  }

  set tripId(value) {
    if (!value) {
      throw new Error('Trip ID is required');
    }
    this.#tripId = String(value);
  }

  set arrivalTime(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Arrival time is required and must be a string');
    }

    // Validate time format (HH:MM:SS, can exceed 24:00:00 for times after midnight)
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(value)) {
      throw new Error('Arrival time must be in HH:MM:SS format');
    }

    this.#arrivalTime = value;
  }

  set departureTime(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Departure time is required and must be a string');
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(value)) {
      throw new Error('Departure time must be in HH:MM:SS format');
    }

    this.#departureTime = value;
  }

  set stopId(value) {
    if (!value) {
      throw new Error('Stop ID is required');
    }
    this.#stopId = String(value);
  }

  set stopSequence(value) {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw new Error('Stop sequence must be a number');
    }

    if (numValue < 0) {
      throw new Error('Stop sequence cannot be negative');
    }

    this.#stopSequence = Math.floor(numValue);
  }

  set stopHeadsign(value) {
    if (value === null || value === undefined) {
      this.#stopHeadsign = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Stop headsign must be a string');
    }

    this.#stopHeadsign = value.trim();
  }

  set pickupType(value) {
    if (value === null || value === undefined) {
      this.#pickupType = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, PICKUP_TYPES, 'pickup_type');
    } catch (error) {
      throw new Error(`Invalid pickup type: ${error.message}`);
    }

    this.#pickupType = stringValue;
  }

  set dropOffType(value) {
    if (value === null || value === undefined) {
      this.#dropOffType = '0';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, DROP_OFF_TYPES, 'drop_off_type');
    } catch (error) {
      throw new Error(`Invalid drop-off type: ${error.message}`);
    }

    this.#dropOffType = stringValue;
  }

  set shapeDistTraveled(value) {
    if (value === null || value === undefined) {
      this.#shapeDistTraveled = null;
      return;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw new Error('Shape distance traveled must be a number');
    }

    if (numValue < 0) {
      throw new Error('Shape distance traveled cannot be negative');
    }

    this.#shapeDistTraveled = numValue;
  }

  set timepoint(value) {
    if (value === null || value === undefined) {
      this.#timepoint = '1';
      return;
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, TIMEPOINT_VALUES, 'timepoint');
    } catch (error) {
      throw new Error(`Invalid timepoint value: ${error.message}`);
    }

    this.#timepoint = stringValue;
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
   * Check if pickup is available
   * @returns {boolean}
   */
  isPickupAvailable() {
    return this.#pickupType === '0';
  }

  /**
   * Check if drop-off is available
   * @returns {boolean}
   */
  isDropOffAvailable() {
    return this.#dropOffType === '0';
  }

  /**
   * Check if times are exact (not approximate)
   * @returns {boolean}
   */
  areTimesExact() {
    return this.#timepoint === '1';
  }

  /**
   * Convert time string to seconds since midnight
   * @param {string} timeString - Time in HH:MM:SS format
   * @returns {number}
   */
  static timeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Convert seconds since midnight to time string
   * @param {number} seconds - Seconds since midnight
   * @returns {string}
   */
  static secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map(val => String(val).padStart(2, '0'))
      .join(':');
  }

  /**
   * Get arrival time in seconds since midnight
   * @returns {number}
   */
  getArrivalSeconds() {
    return StopTime.timeToSeconds(this.#arrivalTime);
  }

  /**
   * Get departure time in seconds since midnight
   * @returns {number}
   */
  getDepartureSeconds() {
    return StopTime.timeToSeconds(this.#departureTime);
  }

  /**
   * Convert stop time to JSON (public fields only)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      tripId: this.#tripId,
      arrivalTime: this.#arrivalTime,
      departureTime: this.#departureTime,
      stopId: this.#stopId,
      stopSequence: this.#stopSequence,
      stopHeadsign: this.#stopHeadsign,
      pickupType: this.#pickupType,
      dropOffType: this.#dropOffType,
      shapeDistTraveled: this.#shapeDistTraveled,
      timepoint: this.#timepoint,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert stop time to database object
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      tripId: this.#tripId,
      arrivalTime: this.#arrivalTime,
      departureTime: this.#departureTime,
      stopId: this.#stopId,
      stopSequence: this.#stopSequence,
      stopHeadsign: this.#stopHeadsign,
      pickupType: this.#pickupType,
      dropOffType: this.#dropOffType,
      shapeDistTraveled: this.#shapeDistTraveled,
      timepoint: this.#timepoint,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Convert stop time to GTFS format (for stop_times.txt export)
   * @returns {Object}
   */
  toGTFS() {
    const gtfs = {
      trip_id: this.#tripId,
      arrival_time: this.#arrivalTime,
      departure_time: this.#departureTime,
      stop_id: this.#stopId,
      stop_sequence: this.#stopSequence
    };

    // Add optional fields if present
    if (this.#stopHeadsign) gtfs.stop_headsign = this.#stopHeadsign;
    if (this.#pickupType !== '0') gtfs.pickup_type = this.#pickupType;
    if (this.#dropOffType !== '0') gtfs.drop_off_type = this.#dropOffType;
    if (this.#shapeDistTraveled !== null) gtfs.shape_dist_traveled = this.#shapeDistTraveled;
    if (this.#timepoint !== '1') gtfs.timepoint = this.#timepoint;

    return gtfs;
  }

  /**
   * Create StopTime instance from database document
   * @param {Object} doc - Database document
   * @returns {StopTime}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create StopTime from null/undefined document');
    }

    return new StopTime({
      id: doc.id || doc._id,
      tripId: doc.tripId,
      arrivalTime: doc.arrivalTime,
      departureTime: doc.departureTime,
      stopId: doc.stopId,
      stopSequence: doc.stopSequence,
      stopHeadsign: doc.stopHeadsign,
      pickupType: doc.pickupType,
      dropOffType: doc.dropOffType,
      shapeDistTraveled: doc.shapeDistTraveled,
      timepoint: doc.timepoint,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Create StopTime instance from GTFS data (stop_times.txt row)
   * @param {Object} gtfsRow - GTFS stop_times.txt row
   * @returns {StopTime}
   */
  static fromGTFS(gtfsRow) {
    if (!gtfsRow) {
      throw new Error('Cannot create StopTime from null/undefined GTFS row');
    }

    return new StopTime({
      tripId: gtfsRow.trip_id,
      arrivalTime: gtfsRow.arrival_time,
      departureTime: gtfsRow.departure_time,
      stopId: gtfsRow.stop_id,
      stopSequence: gtfsRow.stop_sequence,
      stopHeadsign: gtfsRow.stop_headsign,
      pickupType: gtfsRow.pickup_type || '0',
      dropOffType: gtfsRow.drop_off_type || '0',
      shapeDistTraveled: gtfsRow.shape_dist_traveled,
      timepoint: gtfsRow.timepoint || '1'
    });
  }

  /**
   * Get the Firestore collection name for stop times
   * @returns {string}
   */
  static collection() {
    return 'gtfs_stop_times';
  }

  /**
   * Get allowed pickup types
   * @returns {string[]}
   */
  static getPickupTypes() {
    return [...PICKUP_TYPES];
  }

  /**
   * Get allowed drop-off types
   * @returns {string[]}
   */
  static getDropOffTypes() {
    return [...DROP_OFF_TYPES];
  }

  /**
   * Get timepoint values
   * @returns {string[]}
   */
  static getTimepointValues() {
    return [...TIMEPOINT_VALUES];
  }
}

module.exports = StopTime;

