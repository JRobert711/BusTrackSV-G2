/**
 * Users Controller
 *
 * Handles user management HTTP requests.
 * Returns uniform success/error envelopes.
 */

const userService = require('../services/userService');

/**
 * List users with optional filters
 *
 * GET /api/v1/users
 *
 * Query params:
 * - role: string (filter by role: admin, supervisor)
 * - limit: number (default: 10, max: 100)
 *
 * Response 200:
 * {
 *   data: [...]
 * }
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function listUsers(req, res, next) {
  try {
    const { role, limit } = req.query;

    const users = await userService.listUsers({
      role,
      limit: limit ? parseInt(limit, 10) : undefined
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 *
 * GET /api/v1/users/:id
 *
 * Response 200:
 * {
 *   user: {...}
 * }
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        type: 'NOT_FOUND'
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Create user
 *
 * POST /api/v1/users
 *
 * Body:
 * - email: string
 * - name: string
 * - password: string
 * - role: string (optional, admin or supervisor)
 *
 * Response 201:
 * {
 *   user: {...},
 *   token: string,
 *   refreshToken: string
 * }
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function createUser(req, res, next) {
  try {
    const { email, name, password, role } = req.body;

    const result = await userService.register({ email, name, password, role });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update user
 *
 * PATCH /api/v1/users/:id
 *
 * Body:
 * - name: string (optional)
 * - role: string (optional, admin or supervisor)
 *
 * Response 200:
 * {
 *   user: {...}
 * }
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await userService.updateUser(id, { name, role });

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user
 *
 * DELETE /api/v1/users/:id
 *
 * Response 204: No Content
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

