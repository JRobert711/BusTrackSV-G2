/**
 * Validation Utilities
 *
 * Provides regex patterns and validation helpers for common data validation needs.
 */

/**
 * PASSWORD_REGEX
 * Requirements:
 * - 8-128 characters in length
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (!@#$%^&*)
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,128}$/;

/**
 * EMAIL_REGEX
 * Standard email validation pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * USERNAME_REGEX
 * Alphanumeric with underscores and hyphens, 3-30 characters
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Validation Error Class
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

/**
 * Validate password against PASSWORD_REGEX
 * @param {string} password - The password to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If password is invalid
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required', 'password');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long', 'password');
  }

  if (password.length > 128) {
    throw new ValidationError('Password must not exceed 128 characters', 'password');
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new ValidationError(
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (!@#$%^&*)',
      'password'
    );
  }

  return true;
}

/**
 * Validate email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If email is invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (trimmedEmail.length > 254) {
    throw new ValidationError('Email must not exceed 254 characters', 'email');
  }

  return true;
}

/**
 * Validate username
 * @param {string} username - The username to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If username is invalid
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    throw new ValidationError('Username is required', 'username');
  }

  if (!USERNAME_REGEX.test(username)) {
    throw new ValidationError(
      'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens',
      'username'
    );
  }

  return true;
}

/**
 * Validate value against allowed enum values
 * @param {*} value - The value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {boolean} True if valid
 * @throws {ValidationError} If value is not in allowed values
 */
function validateEnum(value, allowedValues, fieldName = 'field') {
  if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
    throw new Error('allowedValues must be a non-empty array');
  }

  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`,
      fieldName
    );
  }

  return true;
}

/**
 * Validate required fields in an object
 * @param {Object} data - The data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {boolean} True if all required fields are present
 * @throws {ValidationError} If any required field is missing
 */
function validateRequiredFields(data, requiredFields) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Data must be a valid object');
  }

  if (!Array.isArray(requiredFields)) {
    throw new Error('requiredFields must be an array');
  }

  const missingFields = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      missingFields[0]
    );
  }

  return true;
}

/**
 * Sanitize string by trimming whitespace
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str.trim();
}

/**
 * Validate MongoDB ObjectId format (if using MongoDB)
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
function isValidObjectId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate positive integer
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {boolean} True if valid
 * @throws {ValidationError} If not a positive integer
 */
function validatePositiveInteger(value, fieldName = 'field') {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError(
      `${fieldName} must be a positive integer`,
      fieldName
    );
  }

  return true;
}

/**
 * Validate coordinate (latitude or longitude)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid coordinates
 * @throws {ValidationError} If coordinates are invalid
 */
function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new ValidationError('Latitude and longitude must be numbers', 'coordinates');
  }

  if (lat < -90 || lat > 90) {
    throw new ValidationError('Latitude must be between -90 and 90', 'latitude');
  }

  if (lng < -180 || lng > 180) {
    throw new ValidationError('Longitude must be between -180 and 180', 'longitude');
  }

  return true;
}

module.exports = {
  // Regex patterns
  PASSWORD_REGEX,
  EMAIL_REGEX,
  USERNAME_REGEX,

  // Error class
  ValidationError,

  // Validation functions
  validatePassword,
  validateEmail,
  validateUsername,
  validateEnum,
  validateRequiredFields,
  validatePositiveInteger,
  validateCoordinates,
  isValidObjectId,

  // Utility functions
  sanitizeString
};
