# Utils

This directory contains utility functions and helpers for JWT operations, validation, and common tasks.

## 📁 Files

### `jwt.js` - JWT Token Management
Handles JWT token generation and verification for authentication.

**Features:**
- Access token generation with short TTL (15 minutes default)
- Refresh token generation with long TTL (7 days default)
- Token verification with clock tolerance (30 seconds)
- Custom error classes for better error handling

**Usage:**
```javascript
const { jwtUtil } = require('./utils/jwt');

// Sign tokens
const accessToken = jwtUtil.signAccess({ id: 1, role: 'admin' });
const refreshToken = jwtUtil.signRefresh({ id: 1 });

// Verify tokens
try {
  const decoded = jwtUtil.verifyAccess(accessToken);
  console.log(decoded); // { id: 1, role: 'admin', iat, exp, iss, aud }
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // Handle expired token
  } else if (error instanceof TokenInvalidError) {
    // Handle invalid token
  }
}

// Decode without verification (for debugging)
const payload = jwtUtil.decode(accessToken);
```

**Error Classes:**
- `JwtError` - Base JWT error
- `TokenExpiredError` - Token has expired
- `TokenInvalidError` - Token is invalid or malformed

### `validation.js` - Input Validation
Provides regex patterns and validation functions for common data validation needs.

**Features:**
- Password validation (8-128 chars, uppercase, lowercase, digit, special char)
- Email validation
- Username validation
- Enum validation
- Required fields validation
- Coordinate validation
- Custom error class with field tracking

**Usage:**
```javascript
const {
  validatePassword,
  validateEmail,
  validateEnum,
  ValidationError
} = require('./utils/validation');

// Validate password
try {
  validatePassword('MyP@ssw0rd123'); // Returns true
} catch (error) {
  console.log(error.message); // Descriptive error
  console.log(error.field); // 'password'
}

// Validate email
validateEmail('user@example.com'); // Returns true

// Validate enum
const roles = ['admin', 'user', 'operator'];
validateEnum('admin', roles, 'role'); // Returns true
```

**Regex Patterns:**
- `PASSWORD_REGEX` - 8-128 chars, 1 upper, 1 lower, 1 digit, 1 special (!@#$%^&*)
- `EMAIL_REGEX` - Standard email format
- `USERNAME_REGEX` - 3-30 alphanumeric with underscores/hyphens

**Validation Functions:**
- `validatePassword(password)` - Password strength check
- `validateEmail(email)` - Email format check
- `validateUsername(username)` - Username format check
- `validateEnum(value, allowedValues, fieldName)` - Enum validation
- `validateRequiredFields(data, requiredFields)` - Check required fields
- `validatePositiveInteger(value, fieldName)` - Positive integer check
- `validateCoordinates(lat, lng)` - GPS coordinate validation
- `isValidObjectId(id)` - MongoDB ObjectId format check

## 🧪 Testing

### Manual Testing
Run manual tests to verify functionality:
```bash
node tests/manual-test.js
```

### Unit Tests
Test placeholders are in `tests/utils/jwt.test.js`. To implement:
```bash
# Install Jest
npm install --save-dev jest

# Update package.json
"test": "jest"

# Run tests
npm test
```

## 🔒 Security Best Practices

1. **JWT Secrets**: Always use strong, random secrets in production
2. **Token Expiration**: Keep access tokens short-lived (15 minutes)
3. **Refresh Tokens**: Use refresh tokens for long-term sessions
4. **Password Validation**: Enforce strong password requirements
5. **Input Sanitization**: Always validate and sanitize user input

## 📝 Error Handling

All utilities throw custom error classes that integrate with the global error handler:

```javascript
// In routes/controllers
try {
  const decoded = jwtUtil.verifyAccess(token);
  // Use decoded payload
} catch (error) {
  // Pass to Express error handler
  next(error);
}
```

The global error handler in `app.js` will automatically:
- Set appropriate HTTP status codes (401 for JWT errors, 400 for validation)
- Format error responses consistently
- Add error type and field information
- Include stack traces in development mode

## 🎯 Future Enhancements

Planned utilities to add:
- `logger.js` - Structured logging with Winston or Pino
- `errors.js` - Additional custom error classes
- `encryption.js` - Data encryption helpers
- `sanitization.js` - XSS and SQL injection prevention
- `rate-limiter.js` - Advanced rate limiting utilities
