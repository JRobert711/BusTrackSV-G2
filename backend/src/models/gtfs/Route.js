/**
 * Route Model (GTFS Standard)
 *
 * Represents a transit route (e.g., Route 101, Express Line A).
 * Based on GTFS routes.txt specification.
 * https://gtfs.org/schedule/reference/#routestxt
 */

const { validateEnum, validateUrl } = require('../../utils/validation');

/**
 * Route types (GTFS standard)
 * 0: Tram/Light rail
 * 1: Subway/Metro
 * 2: Rail
 * 3: Bus (most common in El Salvador)
 * 4: Ferry
 * 5: Cable tram
 * 6: Aerial lift
 * 7: Funicular
 * 11: Trolleybus
 * 12: Monorail
 */
const ROUTE_TYPES = ['0', '1', '2', '3', '4', '5', '6', '7', '11', '12'];

/**
 * Route Class
 *
 * Encapsulates route data with validation.
 * Maps to GTFS routes.txt file.
 */
class Route {
  // Private fields
  #id;
  #agencyId;
  #shortName;
  #longName;
  #desc;
  #type;
  #url;
  #color;
  #textColor;
  #sortOrder;
  #continuousPickup;
  #continuousDropOff;
  #createdAt;
  #updatedAt;

  /**
   * Create a new Route instance
   * @param {Object} data - Route data
   * @param {string} data.id - Route ID
   * @param {string} [data.agencyId] - Agency ID (optional for single-agency feeds)
   * @param {string} data.shortName - Short name (e.g., "101", "Express A")
   * @param {string} data.longName - Long name (e.g., "Centro - Soyapango")
   * @param {string} [data.desc] - Route description
   * @param {string} data.type - Route type (0-12, see ROUTE_TYPES)
   * @param {string} [data.url] - URL with information about the route
   * @param {string} [data.color] - Route color (hex without #, e.g., "FF0000")
   * @param {string} [data.textColor] - Text color (hex without #)
   * @param {number} [data.sortOrder] - Order for presentation
   * @param {string} [data.continuousPickup='1'] - Continuous pickup allowed
   * @param {string} [data.continuousDropOff='1'] - Continuous drop-off allowed
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Route data must be a valid object');
    }

    if (data.id) {
      this.#id = String(data.id);
    }

    this.agencyId = data.agencyId || null;
    this.shortName = data.shortName;
    this.longName = data.longName;
    this.desc = data.desc || null;
    this.type = data.type;
    this.url = data.url || null;
    this.color = data.color || null;
    this.textColor = data.textColor || null;
    this.sortOrder = data.sortOrder || null;
    this.continuousPickup = data.continuousPickup || '1';
    this.continuousDropOff = data.continuousDropOff || '1';

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

  get agencyId() {
    return this.#agencyId;
  }

  get shortName() {
    return this.#shortName;
  }

  get longName() {
    return this.#longName;
  }

  get desc() {
    return this.#desc;
  }

  get type() {
    return this.#type;
  }

  get url() {
    return this.#url;
  }

  get color() {
    return this.#color;
  }

  get textColor() {
    return this.#textColor;
  }

  get sortOrder() {
    return this.#sortOrder;
  }

  get continuousPickup() {
    return this.#continuousPickup;
  }

  get continuousDropOff() {
    return this.#continuousDropOff;
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
      throw new Error('Route ID is required');
    }
    this.#id = String(value);
  }

  set agencyId(value) {
    if (value === null || value === undefined) {
      this.#agencyId = null;
      return;
    }

    this.#agencyId = String(value);
  }

  set shortName(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Route short name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 1) {
      throw new Error('Route short name cannot be empty');
    }

    if (trimmedName.length > 50) {
      throw new Error('Route short name must not exceed 50 characters');
    }

    this.#shortName = trimmedName;
  }

  set longName(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Route long name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 1) {
      throw new Error('Route long name cannot be empty');
    }

    if (trimmedName.length > 255) {
      throw new Error('Route long name must not exceed 255 characters');
    }

    this.#longName = trimmedName;
  }

  set desc(value) {
    if (value === null || value === undefined) {
      this.#desc = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Route description must be a string');
    }

    this.#desc = value.trim();
  }

  set type(value) {
    if (!value) {
      throw new Error('Route type is required');
    }

    const stringValue = String(value);

    try {
      validateEnum(stringValue, ROUTE_TYPES, 'route_type');
    } catch (error) {
      throw new Error(`Invalid route type: ${error.message}`);
    }

    this.#type = stringValue;
  }

  set url(value) {
    if (value === null || value === undefined) {
      this.#url = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Route URL must be a string');
    }

    try {
      validateUrl(value);
    } catch (error) {
      throw new Error(`Invalid route URL: ${error.message}`);
    }

    this.#url = value.trim();
  }

  set color(value) {
    if (value === null || value === undefined) {
      this.#color = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Route color must be a string');
    }

    const trimmedColor = value.trim().toUpperCase();

    // Validate hex color (6 characters, no #)
    if (!/^[0-9A-F]{6}$/.test(trimmedColor)) {
      throw new Error('Route color must be a valid 6-digit hex color (without #)');
    }

    this.#color = trimmedColor;
  }

  set textColor(value) {
    if (value === null || value === undefined) {
      this.#textColor = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Route text color must be a string');
    }

    const trimmedColor = value.trim().toUpperCase();

    // Validate hex color (6 characters, no #)
    if (!/^[0-9A-F]{6}$/.test(trimmedColor)) {
      throw new Error('Route text color must be a valid 6-digit hex color (without #)');
    }

    this.#textColor = trimmedColor;
  }

  set sortOrder(value) {
    if (value === null || value === undefined) {
      this.#sortOrder = null;
      return;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw new Error('Sort order must be a number');
    }

    if (numValue < 0) {
      throw new Error('Sort order cannot be negative');
    }

    this.#sortOrder = Math.floor(numValue);
  }

  set continuousPickup(value) {
    if (value === null || value === undefined) {
      this.#continuousPickup = '1';
      return;
    }

    this.#continuousPickup = String(value);
  }

  set continuousDropOff(value) {
    if (value === null || value === undefined) {
      this.#continuousDropOff = '1';
      return;
    }

    this.#continuousDropOff = String(value);
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
   * Check if route is a bus route
   * @returns {boolean}
   */
  isBus() {
    return this.#type === '3';
  }

  /**
   * Get route color with # prefix
   * @returns {string|null}
   */
  getColorWithHash() {
    return this.#color ? `#${this.#color}` : null;
  }

  /**
   * Get text color with # prefix
   * @returns {string|null}
   */
  getTextColorWithHash() {
    return this.#textColor ? `#${this.#textColor}` : null;
  }

  /**
   * Convert route to JSON (public fields only)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      agencyId: this.#agencyId,
      shortName: this.#shortName,
      longName: this.#longName,
      desc: this.#desc,
      type: this.#type,
      url: this.#url,
      color: this.#color,
      textColor: this.#textColor,
      sortOrder: this.#sortOrder,
      continuousPickup: this.#continuousPickup,
      continuousDropOff: this.#continuousDropOff,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert route to database object
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      agencyId: this.#agencyId,
      shortName: this.#shortName,
      longName: this.#longName,
      desc: this.#desc,
      type: this.#type,
      url: this.#url,
      color: this.#color,
      textColor: this.#textColor,
      sortOrder: this.#sortOrder,
      continuousPickup: this.#continuousPickup,
      continuousDropOff: this.#continuousDropOff,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Convert route to GTFS format (for routes.txt export)
   * @returns {Object}
   */
  toGTFS() {
    const gtfs = {
      route_id: this.#id,
      route_short_name: this.#shortName,
      route_long_name: this.#longName,
      route_type: this.#type
    };

    // Add optional fields if present
    if (this.#agencyId) gtfs.agency_id = this.#agencyId;
    if (this.#desc) gtfs.route_desc = this.#desc;
    if (this.#url) gtfs.route_url = this.#url;
    if (this.#color) gtfs.route_color = this.#color;
    if (this.#textColor) gtfs.route_text_color = this.#textColor;
    if (this.#sortOrder !== null) gtfs.route_sort_order = this.#sortOrder;
    if (this.#continuousPickup !== '1') gtfs.continuous_pickup = this.#continuousPickup;
    if (this.#continuousDropOff !== '1') gtfs.continuous_drop_off = this.#continuousDropOff;

    return gtfs;
  }

  /**
   * Create Route instance from database document
   * @param {Object} doc - Database document
   * @returns {Route}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create Route from null/undefined document');
    }

    return new Route({
      id: doc.id || doc._id,
      agencyId: doc.agencyId,
      shortName: doc.shortName,
      longName: doc.longName,
      desc: doc.desc,
      type: doc.type,
      url: doc.url,
      color: doc.color,
      textColor: doc.textColor,
      sortOrder: doc.sortOrder,
      continuousPickup: doc.continuousPickup,
      continuousDropOff: doc.continuousDropOff,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Create Route instance from GTFS data (routes.txt row)
   * @param {Object} gtfsRow - GTFS routes.txt row
   * @returns {Route}
   */
  static fromGTFS(gtfsRow) {
    if (!gtfsRow) {
      throw new Error('Cannot create Route from null/undefined GTFS row');
    }

    return new Route({
      id: gtfsRow.route_id,
      agencyId: gtfsRow.agency_id,
      shortName: gtfsRow.route_short_name,
      longName: gtfsRow.route_long_name,
      desc: gtfsRow.route_desc,
      type: gtfsRow.route_type,
      url: gtfsRow.route_url,
      color: gtfsRow.route_color,
      textColor: gtfsRow.route_text_color,
      sortOrder: gtfsRow.route_sort_order,
      continuousPickup: gtfsRow.continuous_pickup,
      continuousDropOff: gtfsRow.continuous_drop_off
    });
  }

  /**
   * Get the Firestore collection name for routes
   * @returns {string}
   */
  static collection() {
    return 'gtfs_routes';
  }

  /**
   * Get allowed route types
   * @returns {string[]}
   */
  static getRouteTypes() {
    return [...ROUTE_TYPES];
  }
}

module.exports = Route;

