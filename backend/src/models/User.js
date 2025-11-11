/**
 * User Model
 *
 * OOP entity model with private fields, getters/setters, and validation.
 * Represents a user in the BusTrack SV system.
 */

const { validateEmail, validateEnum } = require('../utils/validation');

/**
 * Allowed user roles
 */
const ALLOWED_ROLES = ['admin', 'supervisor'];

/**
 * User Class
 *
 * Encapsulates user data with validation and business rules.
 * Uses private fields (#) for proper encapsulation.
 */
class User {
  // Private fields
  #id;
  #email;
  #name;
  #role;
  #passwordHash;
  #createdAt;
  #updatedAt;

  /**
   * Create a new User instance
   * @param {Object} data - User data
   * @param {string} data.id - User ID
   * @param {string} data.email - User email
   * @param {string} data.name - User name
   * @param {string} data.role - User role (admin or supervisor)
   * @param {string} data.passwordHash - Hashed password
   * @param {Date|string} [data.createdAt] - Creation timestamp
   * @param {Date|string} [data.updatedAt] - Last update timestamp
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('User data must be a valid object');
    }

    // Set fields using setters (which include validation)
    // id is optional for new instances (Firestore will generate one).
    // Set private field directly to allow creating users before DB assignment.
    if (data.id) {
      this.#id = String(data.id);
    }
    this.email = data.email;
    this.name = data.name;
    this.role = data.role;
    this.passwordHash = data.passwordHash;

    // Set timestamps
    this.#createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.#updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get user ID
   * @returns {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * Get user email (always lowercase)
   * @returns {string}
   */
  get email() {
    return this.#email;
  }

  /**
   * Get user name
   * @returns {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * Get user role
   * @returns {string}
   */
  get role() {
    return this.#role;
  }

  /**
   * Get password hash
   * @returns {string}
   */
  get passwordHash() {
    return this.#passwordHash;
  }

  /**
   * Get creation timestamp
   * @returns {Date}
   */
  get createdAt() {
    return this.#createdAt;
  }

  /**
   * Get last update timestamp
   * @returns {Date}
   */
  get updatedAt() {
    return this.#updatedAt;
  }

  // ============================================
  // Setters with Validation
  // ============================================

  /**
   * Set user ID
   * @param {string} value - User ID
   */
  set id(value) {
    if (!value) {
      throw new Error('User ID is required');
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error('User ID must be a string or number');
    }
    this.#id = String(value);
  }

  /**
   * Set user email (validates format and converts to lowercase)
   * @param {string} value - User email
   */
  set email(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    const trimmedEmail = value.trim().toLowerCase();

    // Validate email format using validation utility
    try {
      validateEmail(trimmedEmail);
    } catch (error) {
      throw new Error(`Invalid email: ${error.message}`);
    }

    this.#email = trimmedEmail;
  }

  /**
   * Set user name (trims whitespace and validates minimum length)
   * @param {string} value - User name
   */
  set name(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Name is required and must be a string');
    }

    const trimmedName = value.trim();

    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (trimmedName.length > 100) {
      throw new Error('Name must not exceed 100 characters');
    }

    this.#name = trimmedName;
  }

  /**
   * Set user role (validates against allowed roles)
   * @param {string} value - User role
   */
  set role(value) {
    if (!value) {
      throw new Error('Role is required');
    }

    // Validate role using validation utility
    try {
      validateEnum(value, ALLOWED_ROLES, 'role');
    } catch (error) {
      throw new Error(`Invalid role: ${error.message}`);
    }

    this.#role = value;
  }

  /**
   * Set password hash
   * @param {string} value - Hashed password
   */
  set passwordHash(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Password hash is required and must be a string');
    }

    if (value.length < 10) {
      throw new Error('Password hash appears to be invalid (too short)');
    }

    this.#passwordHash = value;
  }

  /**
   * Set creation timestamp
   * @param {Date|string} value - Creation timestamp
   */
  set createdAt(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid createdAt date');
    }
    this.#createdAt = date;
  }

  /**
   * Set update timestamp
   * @param {Date|string} value - Update timestamp
   */
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
   * Check if user has admin role
   * @returns {boolean}
   */
  isAdmin() {
    return this.#role === 'admin';
  }

  /**
   * Check if user has supervisor role
   * @returns {boolean}
   */
  isSupervisor() {
    return this.#role === 'supervisor';
  }

  /**
   * Convert user to JSON (safe public fields only)
   * NEVER exposes passwordHash for security
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      name: this.#name,
      role: this.#role,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString()
    };
  }

  /**
   * Convert user to database object (includes passwordHash)
   * Use this when saving to database
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.#id,
      email: this.#email,
      name: this.#name,
      role: this.#role,
      passwordHash: this.#passwordHash,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Create User instance from database document
   * @param {Object} doc - Database document
   * @returns {User}
   */
  static fromDatabase(doc) {
    if (!doc) {
      throw new Error('Cannot create User from null/undefined document');
    }

    return new User({
      id: doc.id || doc._id,
      email: doc.email,
      name: doc.name,
      role: doc.role,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  /**
   * Get the Firestore collection name for users
   * @returns {string}
   */
  static collection() {
    return 'users';
  }

  /**
   * Get allowed roles
   * @returns {string[]}
   */
  static getAllowedRoles() {
    return [...ALLOWED_ROLES];
  }
}

module.exports = User;
