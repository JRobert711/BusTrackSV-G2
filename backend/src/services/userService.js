/**
 * User Service
 *
 * Business logic for user authentication and management.
 * Orchestrates between repositories, models, and utilities.
 */

const bcrypt = require('bcrypt');
const { userRepository } = require('./userRepository');
const { jwtUtil } = require('../utils/jwt');
const { validatePassword, validateEmail } = require('../utils/validation');
const User = require('../models/User');

/**
 * UserService Class
 *
 * Handles user registration, authentication, and token management.
 */
class UserService {
  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  }

  /**
   * Register a new user
   *
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.name - User name
   * @param {string} userData.password - Plain text password
   * @param {string} userData.role - User role (admin or supervisor)
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   * @throws {Error} If email already exists or validation fails
   */
  async register(userData) {
    const { email, name, password, role } = userData;

    // Validate email format
    try {
      validateEmail(email);
    } catch (error) {
      const validationError = new Error(`Email validation failed: ${error.message}`);
      validationError.status = 422;
      validationError.field = 'email';
      throw validationError;
    }

    // Validate password policy
    try {
      validatePassword(password);
    } catch (error) {
      const validationError = new Error(`Password validation failed: ${error.message}`);
      validationError.status = 422;
      validationError.field = 'password';
      throw validationError;
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email already in use');
      error.status = 409;
      error.field = 'email';
      throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create user model
    const user = new User({
      email,
      name,
      role: role || 'supervisor', // Default to supervisor
      passwordHash
    });

    // Save to database
    const createdUser = await userRepository.create(user);

    // Generate tokens
    const tokenPayload = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    };

    const token = jwtUtil.signAccess(tokenPayload);
    const refreshToken = jwtUtil.signRefresh(tokenPayload);

    // Return user (safe fields only) and tokens
    return {
      user: createdUser.toJSON(),
      token,
      refreshToken
    };
  }

  /**
   * Authenticate user and generate tokens
   *
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - Plain text password
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   * @throws {Error} If credentials are invalid (401)
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwtUtil.signAccess(tokenPayload);
    const refreshToken = jwtUtil.signRefresh(tokenPayload);

    // Return user (safe fields only) and tokens
    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{token: string, refreshToken: string}>}
   * @throws {Error} If refresh token is invalid
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwtUtil.verifyRefresh(refreshToken);

      // Generate new tokens
      const tokenPayload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      const newToken = jwtUtil.signAccess(tokenPayload);
      const newRefreshToken = jwtUtil.signRefresh(tokenPayload);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      const tokenError = new Error('Invalid or expired refresh token');
      tokenError.status = 401;
      throw tokenError;
    }
  }

  /**
   * Get user by ID
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    return user ? user.toJSON() : null;
  }

  /**
   * Get user by email
   *
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    return user ? user.toJSON() : null;
  }
}

// Export singleton instance
module.exports = new UserService();
