/**
 * Validation Middleware
 *
 * Reusable Joi validation middleware for req.body, req.query, and req.params.
 * Returns consistent validation error responses.
 */

/**
 * Create validation middleware
 *
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} source - Where to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 *
 * Error response format (422):
 * {
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid request data",
 *     "details": { "field": "reason" }
 *   }
 * }
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    // Validate the specified source (body, query, or params)
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Collect all errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types (e.g., string to number)
    });

    if (error) {
      // Format validation errors with per-field details
      const details = {};

      error.details.forEach(detail => {
        const field = detail.path.join('.');
        // Store only the first error message for each field
        if (!details[field]) {
          details[field] = detail.message;
        }
      });

      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details
        }
      });
    }

    // Replace req[source] with validated and sanitized value
    req[source] = value;
    next();
  };
}

/**
 * Helper: Validate request body
 *
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 *
 * Usage:
 * router.post('/users', validateBody(userSchema), createUser);
 */
function validateBody(schema) {
  return validate(schema, 'body');
}

/**
 * Helper: Validate query parameters
 *
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 *
 * Usage:
 * router.get('/users', validateQuery(querySchema), listUsers);
 */
function validateQuery(schema) {
  return validate(schema, 'query');
}

/**
 * Helper: Validate route parameters
 *
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 *
 * Usage:
 * router.get('/users/:id', validateParams(idSchema), getUser);
 */
function validateParams(schema) {
  return validate(schema, 'params');
}

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
