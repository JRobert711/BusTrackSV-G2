# Middlewares

Reusable Express middlewares for authentication, error handling, and request processing.

## 📁 Available Middlewares

### `validation.js` - Request Validation

**Validation Helpers:**
- `validate(schema, source)` - Generic validation for any request property
- `validateBody(schema)` - Validate request body
- `validateQuery(schema)` - Validate query parameters
- `validateParams(schema)` - Validate route parameters

**Error Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": "Email must be a valid email address",
      "password": "Password must be at least 8 characters long"
    }
  }
}
```

**Usage:**
```javascript
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');
const Joi = require('joi');

// Define schemas
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const idParamSchema = Joi.object({
  id: Joi.string().required()
});

// Apply to routes
router.post('/users', validateBody(createUserSchema), createUser);
router.get('/users', validateQuery(querySchema), listUsers);
router.get('/users/:id', validateParams(idParamSchema), getUser);
```

**Features:**
- ✅ Validates req.body, req.query, or req.params
- ✅ Returns 422 with per-field error details
- ✅ Strips unknown fields automatically
- ✅ Converts types (e.g., string to number)
- ✅ Actionable error messages
- ✅ Consistent error format across all endpoints

### `auth.js` - Authentication & Authorization

**Authentication:**
- `authenticateToken` - Verifies JWT Bearer tokens
- `optionalAuth` - Optional authentication (doesn't fail if missing)

**Authorization:**
- `requireRole(...roles)` - Requires specific role(s)
- `requireAdmin` - Shortcut for `requireRole('admin')`
- `requireSupervisorOrAdmin` - Shortcut for `requireRole('supervisor', 'admin')`

**Usage:**
```javascript
const { authenticateToken, requireRole, requireAdmin } = require('../middlewares/auth');

// Protect route - requires valid token
router.get('/profile', authenticateToken, getProfile);

// Require specific role
router.get('/admin', authenticateToken, requireAdmin, adminDashboard);

// Require one of multiple roles
router.get('/manage', authenticateToken, requireRole('admin', 'supervisor'), manage);

// Optional auth (different behavior for authenticated users)
router.get('/feed', optionalAuth, getFeed);
```

**Responses:**

401 UNAUTHORIZED (missing/invalid token):
```json
{
  "error": "Authorization header is required",
  "type": "UNAUTHORIZED"
}
```

403 FORBIDDEN (insufficient role):
```json
{
  "error": "Access denied. Required role(s): admin. Your role: user",
  "type": "FORBIDDEN"
}
```

**How it works:**
1. Reads `Authorization: Bearer <token>` header
2. Verifies token using `JwtUtil.verifyAccess`
3. Attaches decoded user to `req.user`
4. Role middleware checks `req.user.role`

### `error.middleware.js` - Global Error Handler

Handles all errors and returns uniform JSON envelope.

**Features:**
- Catches JWT errors (401)
- Catches validation errors (400)
- Catches all other errors (500)
- Adds stack trace in development

### `notFound.middleware.js` - 404 Handler

Returns 404 for undefined routes.

## 🔒 Protected Routes Example

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { getBuses, createBus } = require('../controllers/bus.controller');

// Public route
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Protected route - any authenticated user
router.get('/buses', authenticateToken, getBuses);

// Admin only route
router.post('/buses', authenticateToken, requireAdmin, createBus);

// Multiple roles allowed
router.put('/buses/:id', 
  authenticateToken, 
  requireRole('admin', 'supervisor'), 
  updateBus
);
```

## 🧪 Testing

**Validation Middleware Tests:**
```bash
node tests/middlewares/validation.test.js
```

Test coverage:
- ✅ validateBody success cases (3 tests)
- ✅ validateBody error format (3 tests)
- ✅ validateQuery parameters (3 tests)
- ✅ validateParams parameters (2 tests)
- ✅ Generic validate function (3 tests)
- ✅ Actionable error messages (1 test)

**Total: 15 tests, all passing**

**Auth Middleware Tests:**
```bash
node tests/middlewares/auth.test.js
```

Test coverage:
- ✅ Valid token authentication (2 tests)
- ✅ Missing/invalid token → 401 (5 tests)
- ✅ Role authorization success (3 tests)
- ✅ Insufficient role → 403 (4 tests)
- ✅ Optional auth (3 tests)
- ✅ Full auth flow integration (2 tests)

**Total: 19 tests, all passing**

## 📝 Best Practices

1. **Always validate request data**
   ```javascript
   // ✓ Good - validate before processing
   router.post('/users', 
     validateBody(userSchema), 
     createUser
   );
   
   // ✗ Bad - no validation
   router.post('/users', createUser); // Unsafe!
   ```

2. **Always use authenticateToken first**
   ```javascript
   // ✓ Good
   router.get('/admin', authenticateToken, requireAdmin, handler);
   
   // ✗ Bad
   router.get('/admin', requireAdmin, handler); // req.user not set!
   ```

3. **One middleware per responsibility**
   - Validation separate from authentication
   - Authentication separate from authorization
   - Each middleware does one thing well

4. **Export named functions**
   ```javascript
   // ✓ Good
   const { authenticateToken, requireAdmin } = require('./auth');
   
   // ✗ Bad
   const auth = require('./auth');
   ```

5. **Don't put business logic in middleware**
   ```javascript
   // ✓ Good - middleware just checks auth
   function authenticateToken(req, res, next) {
     // Verify token
     // Attach user
     // Call next()
   }
   
   // ✗ Bad - business logic in middleware
   function authenticateToken(req, res, next) {
     // Verify token
     // Load user from database
     // Check subscription status
     // Update last login time
     // ...
   }
   ```

6. **Use optionalAuth for public/private views**
   ```javascript
   router.get('/feed', optionalAuth, (req, res) => {
     if (req.user) {
       // Authenticated user - show personalized feed
       return res.json({ feed: getPersonalizedFeed(req.user) });
     } else {
       // Public user - show general feed
       return res.json({ feed: getPublicFeed() });
     }
   });
   ```
