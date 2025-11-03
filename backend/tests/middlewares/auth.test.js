/**
 * Manual Tests for Auth Middleware
 *
 * Run with: node tests/middlewares/auth.test.js
 */

require('dotenv').config();
const { authenticateToken, requireRole, requireAdmin, optionalAuth } = require('../../src/middlewares/auth');
const { jwtUtil } = require('../../src/utils/jwt');

console.log('='.repeat(60));
console.log('🧪 Auth Middleware Test Suite');
console.log('='.repeat(60));

let passedTests = 0;
let failedTests = 0;

/**
 * Helper to run a test
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failedTests++;
  }
}

/**
 * Helper to assert condition
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Mock request/response objects
 */
function createMockReq(headers = {}, user = null) {
  return {
    headers,
    user
  };
}

function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

function createNext() {
  let called = false;
  const next = () => {
    called = true;
  };
  next.wasCalled = () => called;
  return next;
}

// ============================================
// Test Suite: authenticateToken - Success Cases
// ============================================
console.log('\n📝 authenticateToken - Success Cases\n');

test('Should authenticate valid token', () => {
  const token = jwtUtil.signAccess({ id: '1', username: 'testuser', role: 'admin' });
  const req = createMockReq({ authorization: `Bearer ${token}` });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.user !== null, 'req.user should be set');
  assert(req.user.id === '1', 'User ID should match');
  assert(req.user.username === 'testuser', 'Username should match');
  assert(req.user.role === 'admin', 'Role should match');
});

test('Should decode token with all claims', () => {
  const token = jwtUtil.signAccess({ id: '2', email: 'test@example.com', role: 'supervisor' });
  const req = createMockReq({ authorization: `Bearer ${token}` });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.user.id === '2', 'User ID should be in req.user');
  assert(req.user.email === 'test@example.com', 'Email should be in req.user');
  assert(req.user.role === 'supervisor', 'Role should be in req.user');
  assert(req.user.iss === 'bustrack-sv', 'Issuer should be in req.user');
  assert(req.user.aud === 'bustrack-api', 'Audience should be in req.user');
});

// ============================================
// Test Suite: authenticateToken - 401 UNAUTHORIZED
// ============================================
console.log('\n📝 authenticateToken - 401 UNAUTHORIZED\n');

test('Should return 401 for missing Authorization header', () => {
  const req = createMockReq({});
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.error, 'Response should have error message');
  assert(res.body.type === 'UNAUTHORIZED', 'Type should be UNAUTHORIZED');
});

test('Should return 401 for invalid format (not Bearer)', () => {
  const req = createMockReq({ authorization: 'Basic abc123' });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.error.includes('Bearer'), 'Error should mention Bearer format');
});

test('Should return 401 for empty token', () => {
  const req = createMockReq({ authorization: 'Bearer ' });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.type === 'UNAUTHORIZED', 'Type should be UNAUTHORIZED');
});

test('Should return 401 for invalid token', () => {
  const req = createMockReq({ authorization: 'Bearer invalid.token.here' });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.type === 'TOKEN_INVALID', 'Type should be TOKEN_INVALID');
});

test('Should return 401 for malformed token', () => {
  const req = createMockReq({ authorization: 'Bearer notajwt' });
  const res = createMockRes();
  const next = createNext();

  authenticateToken(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(res.body.type === 'TOKEN_INVALID', 'Type should be TOKEN_INVALID');
});

// ============================================
// Test Suite: requireRole - Success Cases
// ============================================
console.log('\n📝 requireRole - Success Cases\n');

test('Should allow user with exact role', () => {
  const req = createMockReq({}, { id: '1', role: 'admin' });
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin');

  middleware(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(res.statusCode === null, 'No status should be set');
});

test('Should allow user with one of multiple roles', () => {
  const req = createMockReq({}, { id: '1', role: 'supervisor' });
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin', 'supervisor');

  middleware(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
});

test('requireAdmin should allow admin users', () => {
  const req = createMockReq({}, { id: '1', role: 'admin' });
  const res = createMockRes();
  const next = createNext();

  requireAdmin(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
});

// ============================================
// Test Suite: requireRole - 403 FORBIDDEN
// ============================================
console.log('\n📝 requireRole - 403 FORBIDDEN\n');

test('Should return 403 for user without required role', () => {
  const req = createMockReq({}, { id: '1', role: 'user' });
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin');

  middleware(req, res, next);

  assert(res.statusCode === 403, 'Status should be 403');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.type === 'FORBIDDEN', 'Type should be FORBIDDEN');
  assert(res.body.error.includes('admin'), 'Error should mention required role');
});

test('Should return 403 for user with different role', () => {
  const req = createMockReq({}, { id: '1', role: 'supervisor' });
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin');

  middleware(req, res, next);

  assert(res.statusCode === 403, 'Status should be 403');
  assert(res.body.error.includes('admin'), 'Error should mention required role');
  assert(res.body.error.includes('supervisor'), 'Error should mention user role');
});

test('Should return 403 for user without role property', () => {
  const req = createMockReq({}, { id: '1' }); // No role
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin');

  middleware(req, res, next);

  assert(res.statusCode === 403, 'Status should be 403');
  assert(res.body.error.includes('not defined'), 'Error should mention role not defined');
});

test('Should return 401 for unauthenticated user (no req.user)', () => {
  const req = createMockReq({}, null); // No user
  const res = createMockRes();
  const next = createNext();
  const middleware = requireRole('admin');

  middleware(req, res, next);

  assert(res.statusCode === 401, 'Status should be 401');
  assert(res.body.type === 'UNAUTHORIZED', 'Type should be UNAUTHORIZED');
  assert(res.body.error.includes('authenticateToken'), 'Error should mention authenticateToken');
});

// ============================================
// Test Suite: optionalAuth
// ============================================
console.log('\n📝 optionalAuth - Optional Authentication\n');

test('Should set req.user to null when no token provided', () => {
  const req = createMockReq({});
  const res = createMockRes();
  const next = createNext();

  optionalAuth(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.user === null, 'req.user should be null');
  assert(res.statusCode === null, 'No status should be set');
});

test('Should authenticate valid token when provided', () => {
  const token = jwtUtil.signAccess({ id: '1', role: 'admin' });
  const req = createMockReq({ authorization: `Bearer ${token}` });
  const res = createMockRes();
  const next = createNext();

  optionalAuth(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.user !== null, 'req.user should be set');
  assert(req.user.id === '1', 'User ID should match');
});

test('Should set req.user to null for invalid token', () => {
  const req = createMockReq({ authorization: 'Bearer invalid.token' });
  const res = createMockRes();
  const next = createNext();

  optionalAuth(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.user === null, 'req.user should be null for invalid token');
});

// ============================================
// Test Suite: Integration - Full Flow
// ============================================
console.log('\n📝 Integration - Full Authentication Flow\n');

test('Should handle full auth flow: token → requireRole', () => {
  const token = jwtUtil.signAccess({ id: '1', username: 'admin', role: 'admin' });

  // Step 1: authenticateToken
  const req = createMockReq({ authorization: `Bearer ${token}` });
  const res = createMockRes();
  const next1 = createNext();

  authenticateToken(req, res, next1);

  assert(next1.wasCalled(), 'authenticateToken should call next()');
  assert(req.user.role === 'admin', 'User role should be set');

  // Step 2: requireRole('admin')
  const next2 = createNext();
  const middleware = requireRole('admin');
  middleware(req, res, next2);

  assert(next2.wasCalled(), 'requireRole should call next()');
});

test('Should handle full auth flow: token → requireRole (denied)', () => {
  const token = jwtUtil.signAccess({ id: '1', username: 'user', role: 'user' });

  // Step 1: authenticateToken
  const req = createMockReq({ authorization: `Bearer ${token}` });
  const res = createMockRes();
  const next1 = createNext();

  authenticateToken(req, res, next1);

  assert(next1.wasCalled(), 'authenticateToken should call next()');
  assert(req.user.role === 'user', 'User role should be set');

  // Step 2: requireRole('admin') - should fail
  const next2 = createNext();
  const middleware = requireRole('admin');
  middleware(req, res, next2);

  assert(!next2.wasCalled(), 'requireRole should NOT call next()');
  assert(res.statusCode === 403, 'Status should be 403');
  assert(res.body.type === 'FORBIDDEN', 'Type should be FORBIDDEN');
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 Test Results');
console.log('='.repeat(60));
console.log(`Total Tests: ${passedTests + failedTests}`);
console.log(`✓ Passed: ${passedTests}`);
console.log(`✗ Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n✅ All tests passed!');
  console.log('='.repeat(60));
  process.exit(0);
} else {
  console.log(`\n❌ ${failedTests} test(s) failed`);
  console.log('='.repeat(60));
  process.exit(1);
}
