# Middlewares

Reusable Express middlewares for authentication, error handling, and request processing.

## 📁 Available Middlewares

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

Run auth middleware tests:
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

1. **Always use authenticateToken first**
   ```javascript
   // ✓ Good
   router.get('/admin', authenticateToken, requireAdmin, handler);
   
   // ✗ Bad
   router.get('/admin', requireAdmin, handler); // req.user not set!
   ```

2. **One middleware per responsibility**
   - Authentication separate from authorization
   - Each middleware does one thing well

3. **Export named functions**
   ```javascript
   // ✓ Good
   const { authenticateToken, requireAdmin } = require('./auth');
   
   // ✗ Bad
   const auth = require('./auth');
   ```

4. **Don't put business logic in middleware**
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

5. **Use optionalAuth for public/private views**
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
