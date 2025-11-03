/**
 * Authentication Middleware
 *
 * Handles JWT token verification and role-based access control.
 * Works across all protected routes.
 */

const { jwtUtil, TokenExpiredError, TokenInvalidError } = require('../utils/jwt');

/**
 * Authenticate Token Middleware
 *
 * Reads Authorization: Bearer <token>, verifies with JwtUtil.verifyAccess,
 * and attaches decoded user to req.user.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 *
 * Response on error:
 * - 401 UNAUTHORIZED: Missing or invalid token
 */
function authenticateToken(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is required',
        type: 'UNAUTHORIZED'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header must be in format: Bearer <token>',
        type: 'UNAUTHORIZED'
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Check if token is present
    if (!token || token.trim() === '') {
      return res.status(401).json({
        error: 'Token is missing',
        type: 'UNAUTHORIZED'
      });
    }

    // Verify token using JwtUtil
    const decoded = jwtUtil.verifyAccess(token);

    // Attach decoded user to request
    req.user = decoded;

    // Continue to next middleware
    next();
  } catch (error) {
    // Handle token errors
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: 'Token has expired. Please login again.',
        type: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof TokenInvalidError) {
      return res.status(401).json({
        error: error.message || 'Invalid or malformed token',
        type: 'TOKEN_INVALID'
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error in authenticateToken:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      type: 'UNAUTHORIZED'
    });
  }
}

/**
 * Require Role Middleware Factory
 *
 * Creates middleware that ensures req.user.role is in the allowed list.
 * Must be used after authenticateToken middleware.
 *
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 *
 * Usage:
 * ```javascript
 * router.get('/admin', authenticateToken, requireRole('admin'), handler);
 * router.get('/staff', authenticateToken, requireRole('admin', 'supervisor'), handler);
 * ```
 *
 * Response on error:
 * - 403 FORBIDDEN: User doesn't have required role
 */
function requireRole(...roles) {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required. Use authenticateToken middleware first.',
          type: 'UNAUTHORIZED'
        });
      }

      // Check if user has a role
      if (!req.user.role) {
        return res.status(403).json({
          error: 'User role is not defined',
          type: 'FORBIDDEN'
        });
      }

      // Check if user's role is in the allowed list
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          type: 'FORBIDDEN'
        });
      }

      // User has required role, continue
      next();
    } catch (error) {
      console.error('Unexpected error in requireRole:', error);
      return res.status(403).json({
        error: 'Access denied',
        type: 'FORBIDDEN'
      });
    }
  };
}

/**
 * Require Admin Role Middleware
 *
 * Convenience middleware that requires 'admin' role.
 * Equivalent to requireRole('admin').
 */
const requireAdmin = requireRole('admin');

/**
 * Require Supervisor or Admin Role Middleware
 *
 * Convenience middleware that requires 'supervisor' or 'admin' role.
 * Equivalent to requireRole('supervisor', 'admin').
 */
const requireSupervisorOrAdmin = requireRole('supervisor', 'admin');

/**
 * Optional Authentication Middleware
 *
 * Attempts to authenticate the user but doesn't fail if token is missing.
 * Useful for routes that have different behavior for authenticated users.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // If no auth header, just continue without user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  // Try to authenticate
  try {
    const token = authHeader.substring(7);
    if (token && token.trim() !== '') {
      const decoded = jwtUtil.verifyAccess(token);
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    // On error, just continue without user
    req.user = null;
    next();
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSupervisorOrAdmin,
  optionalAuth
};
