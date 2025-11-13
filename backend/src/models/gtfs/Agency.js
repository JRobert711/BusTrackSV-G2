/**
 * Agency Model (GTFS Standard)
 *
 * Represents a transit agency that operates routes.
 * Based on GTFS agency.txt specification.
 * https://gtfs.org/schedule/reference/#agencytxt
 */

const { validateUrl, validateEmail, validateEnum } = require('../../utils/validation');

/**
 * Allowed timezone values (subset of common timezones)
 * Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
const COMMON_TIMEZONES = [
  'America/El_Salvador',
  'America/Guatemala',
  'America/Tegucigalpa',
  'America/Managua',
  'America/Costa_Rica',
  'America/Panama',
  'America/Mexico_City',
  'UTC'
];

/**
 * Agency Class
 *
 * Encapsulates transit agency data with validation.
 * Maps to GTFS agency.txt file.
 */
class Agency {
  // Private fields
  #id;
  #name;
  #url;
  #timezone;
  #lang;
  #phone;
  #fareUrl;
  #email;
  #createdAt;
  #updatedAt;

  /**
   * Create a new Agency instance
   * @param {Object} data - Agency data
   * @param {string} [data.id] - Agency ID (optional for single agency)
   * @param {string} data.name - Full name of the agency (e.g., "Autobuses Metropolitanos")
   * @param {string} data.url - Agency website URL
   * @param {string} data.timezone - Timezone (e.g., "America/El_Salvador")
   * @param {string} [data.lang] - Primary language (ISO 639-1, e.g., "es")
   * @param {string} [data.phone] - Phone number
   * @param {string} [data.fareUrl] - URL for purchasing tickets
   * @param {string} [data.email] - Customer service email
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Agency data must be a valid object');
    }

    // id is optional for single-agency feeds
    if (data.id) {
      this.#id = String(data.id);
    }

    this.name = data.name;
    this.url = data.url;
    this.timezone = data.timezone;
    this.lang = data.lang || 'es'; // Default to Spanish
    this.phone = data.phone || null;
    this.fareUrl = data.fareUrl || null;
    this.email = data.email || null;

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

  get name() {
    return this.#name;
  }

  get url() {
    return this.#url;
  }

  get timezone() {
    return this.#timezone;
  }

  get lang() {
    return this.#lang;
  }

  get phone() {
    return this.#phone;
  }

  get fareUrl() {
    return this.#fareUrl;
  }

  get email() {
    return this.#email;
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
      throw new Error('Agency ID is required');
    }
    this.#id = String(value);
  }

  set name(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Agency name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 2) {
      throw new Error('Agency name must be at least 2 characters long');
    }

    if (trimmedName.length > 255) {
      throw new Error('Agency name must not exceed 255 characters');
    }

    this.#name = trimmedName;
  }

  set url(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Agency URL is required and must be a string');
    }

    try {
      validateUrl(value);
    } catch (error) {
      throw new Error(`Invalid agency URL: ${error.message}`);
    }

    this.#url = value.trim();
  }

  set timezone(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Agency timezone is required and must be a string');
    }

    // Basic validation - check if it's in common timezones
    // In production, you might want to validate against full TZ database
    const trimmedTz = value.trim();

    if (!COMMON_TIMEZONES.includes(trimmedTz)) {
      console.warn(`Timezone "${trimmedTz}" is not in common timezones list. Proceeding anyway.`);
    }

    this.#timezone = trimmedTz;
  }

  set lang(value) {
    if (value === null || value === undefined) {
      this.#lang = 'es'; // Default to Spanish
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Language must be a string');
    }

    const trimmedLang = value.trim().toLowerCase();

    // Validate ISO 639-1 format (2 letters)
    if (!/^[a-z]{2}$/.test(trimmedLang)) {
      throw new Error('Language must be a valid ISO 639-1 code (2 letters, e.g., "es", "en")');
    }

    this.#lang = trimmedLang;
  }

  set phone(value) {
    if (value === null || value === undefined) {
      this.#phone = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Phone must be a string');
    }

    this.#phone = value.trim();
  }

  set fareUrl(value) {
    if (value === null || value === undefined) {
      this.#fareUrl = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Fare URL must be a string');
    }

    try {
      validateUrl(value);
    } catch (error) {
      throw new Error(`Invalid fare URL: ${error.message}`);
    }

    this.#fareUrl = value.trim();
  }

  set email(value) {
    if (value === null || value === undefined) {
      this.#email = null;
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('Email must be a string');
    }

    const trimmedEmail = value.trim().toLowerCase();

    try {
      validateEmail(trimmedEmail);
    } catch (error) {
      throw new Error(`Invalid agency email: ${error.message}`);
    }

    this.#email = trimmedEmail;
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
   * Convert agency to JSON (public fields only)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      url: this.#url,
      timezone: this.#timezone,
      lang: this.#lang,
      phone: this.#phone,
      fareUrl: this.#fareUrl,
      email: this.#email,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert agency to database object
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      name: this.#name,
      url: this.#url,
      timezone: this.#timezone,
      lang: this.#lang,
      phone: this.#phone,
      fareUrl: this.#fareUrl,
      email: this.#email,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Convert agency to GTFS format (for agency.txt export)
   * @returns {Object}
   */
  toGTFS() {
    const gtfs = {
      agency_name: this.#name,
      agency_url: this.#url,
      agency_timezone: this.#timezone,
      agency_lang: this.#lang
    };

    // Add optional fields if present
    if (this.#id) gtfs.agency_id = this.#id;
    if (this.#phone) gtfs.agency_phone = this.#phone;
    if (this.#fareUrl) gtfs.agency_fare_url = this.#fareUrl;
    if (this.#email) gtfs.agency_email = this.#email;

    return gtfs;
  }

  /**
   * Create Agency instance from database document
   * @param {Object} doc - Database document
   * @returns {Agency}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create Agency from null/undefined document');
    }

    return new Agency({
      id: doc.id || doc._id,
      name: doc.name,
      url: doc.url,
      timezone: doc.timezone,
      lang: doc.lang,
      phone: doc.phone,
      fareUrl: doc.fareUrl,
      email: doc.email,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Create Agency instance from GTFS data (agency.txt row)
   * @param {Object} gtfsRow - GTFS agency.txt row
   * @returns {Agency}
   */
  static fromGTFS(gtfsRow) {
    if (!gtfsRow) {
      throw new Error('Cannot create Agency from null/undefined GTFS row');
    }

    return new Agency({
      id: gtfsRow.agency_id,
      name: gtfsRow.agency_name,
      url: gtfsRow.agency_url,
      timezone: gtfsRow.agency_timezone,
      lang: gtfsRow.agency_lang,
      phone: gtfsRow.agency_phone,
      fareUrl: gtfsRow.agency_fare_url,
      email: gtfsRow.agency_email
    });
  }

  /**
   * Get the Firestore collection name for agencies
   * @returns {string}
   */
  static collection() {
    return 'gtfs_agencies';
  }
}

module.exports = Agency;

