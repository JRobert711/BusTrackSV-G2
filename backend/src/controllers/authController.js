/**
 * Auth Controller
 *
 * Handles authentication HTTP requests.
 * Returns uniform success/error envelopes.
 */

const userService = require('../services/userService');

/**
 * Register a new user
 *
 * POST /api/v1/auth/register
 *
 * Request body:
 * {
 *   email: string,
 *   name: string,
 *   password: string,
 *   role: 'admin' | 'supervisor' (optional, defaults to 'supervisor')
 * }
 *
 * Response 201:
 * {
 *   user: { id, email, name, role, createdAt, updatedAt },
 *   token: string,
 *   refreshToken: string
 * }
 *
 * Response 409: Email already exists
 * Response 422: Validation failed
 * Response 500: Server error
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function register(req, res, next) {
  try {
    const { email, name, password, role } = req.body;

    // Register user (validation happens in service)
    const result = await userService.register({
      email,
      name,
      password,
      role
    });

    // Return success with 201 Created
    return res.status(201).json(result);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
}

/**
 * Login user
 *
 * POST /api/v1/auth/login
 *
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * Response 200:
 * {
 *   user: { id, email, name, role, createdAt, updatedAt },
 *   token: string,
 *   refreshToken: string
 * }
 *
 * Response 401: Invalid credentials
 * Response 422: Validation failed
 * Response 500: Server error
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const result = await userService.login({
      email,
      password
    });

    // Return success with 200 OK
    return res.status(200).json(result);
  } catch (error) {
    // Pass error to global error handler (will be 401 for invalid credentials)
    next(error);
  }
}

/**
 * Refresh access token
 *
 * POST /api/v1/auth/refresh
 *
 * Request body:
 * {
 *   refreshToken: string
 * }
 *
 * Response 200:
 * {
 *   token: string,
 *   refreshToken: string
 * }
 *
 * Response 401: Invalid refresh token
 * Response 422: Validation failed
 * Response 500: Server error
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.status = 422;
      error.field = 'refreshToken';
      throw error;
    }

    // Refresh tokens
    const result = await userService.refreshToken(refreshToken);

    // Return success
    return res.status(200).json(result);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
}

/**
 * Get current user profile
 *
 * GET /api/v1/auth/me
 *
 * Requires: authenticateToken middleware
 *
 * Response 200:
 * {
 *   user: { id, email, name, role, createdAt, updatedAt }
 * }
 *
 * Response 401: Not authenticated
 * Response 404: User not found
 * Response 500: Server error
 *
 * @param {Object} req - Express request (req.user set by authenticateToken)
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getProfile(req, res, next) {
  try {
    // req.user is set by authenticateToken middleware
    const userId = req.user.id;

    const user = await userService.getUserById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  getProfile
};
