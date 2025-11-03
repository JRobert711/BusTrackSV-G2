/**
 * Manual Tests for Validation Middleware
 *
 * Run with: node tests/middlewares/validation.test.js
 */

const Joi = require('joi');
const { validate, validateBody, validateQuery, validateParams } = require('../../src/middlewares/validation');

console.log('='.repeat(60));
console.log('🧪 Validation Middleware Test Suite');
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
function createMockReq(body = {}, query = {}, params = {}) {
  return { body, query, params };
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
// Test Suite: validateBody - Success Cases
// ============================================
console.log('\n📝 validateBody - Success Cases\n');

test('Should validate valid body data', () => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).required()
  });

  const req = createMockReq({ email: 'test@example.com', name: 'John Doe' });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.body.email === 'test@example.com', 'Email should be in body');
  assert(req.body.name === 'John Doe', 'Name should be in body');
  assert(res.statusCode === null, 'No status should be set');
});

test('Should strip unknown fields', () => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const req = createMockReq({ email: 'test@example.com', extra: 'field' });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.body.email === 'test@example.com', 'Email should be in body');
  assert(!req.body.extra, 'Unknown field should be stripped');
});

test('Should convert types', () => {
  const schema = Joi.object({
    age: Joi.number().required()
  });

  const req = createMockReq({ age: '25' }); // String
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.body.age === 25, 'String should be converted to number');
  assert(typeof req.body.age === 'number', 'Type should be number');
});

// ============================================
// Test Suite: validateBody - Error Format
// ============================================
console.log('\n📝 validateBody - Error Format (422)\n');

test('Should return 422 with correct error format', () => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const req = createMockReq({ email: 'invalid-email' });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(!next.wasCalled(), 'next() should not be called');
  assert(res.body.error, 'Response should have error object');
  assert(res.body.error.code === 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  assert(res.body.error.message === 'Invalid request data', 'Error message should match');
  assert(res.body.error.details, 'Error should have details');
});

test('Should return per-field error details', () => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    age: Joi.number().min(18).required()
  });

  const req = createMockReq({ email: 'invalid', age: 'not-a-number' });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(res.body.error.details.email, 'Should have email error');
  assert(res.body.error.details.age, 'Should have age error');
});

test('Should return nested field errors', () => {
  const schema = Joi.object({
    position: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    }).required()
  });

  const req = createMockReq({ position: { lat: 100, lng: 200 } });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(res.body.error.details['position.lat'], 'Should have lat error');
  assert(res.body.error.details['position.lng'], 'Should have lng error');
});

// ============================================
// Test Suite: validateQuery
// ============================================
console.log('\n📝 validateQuery - Query Parameters\n');

test('Should validate valid query parameters', () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  });

  const req = createMockReq({}, { page: '2', limit: '20' }, {});
  const res = createMockRes();
  const next = createNext();

  validateQuery(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.query.page === 2, 'Page should be converted to number');
  assert(req.query.limit === 20, 'Limit should be converted to number');
});

test('Should apply defaults for missing query parameters', () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  });

  const req = createMockReq({}, {}, {});
  const res = createMockRes();
  const next = createNext();

  validateQuery(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.query.page === 1, 'Page should default to 1');
  assert(req.query.limit === 10, 'Limit should default to 10');
});

test('Should return 422 for invalid query parameters', () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).required()
  });

  const req = createMockReq({}, { page: 'invalid' }, {});
  const res = createMockRes();
  const next = createNext();

  validateQuery(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(res.body.error.code === 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  assert(res.body.error.details.page, 'Should have page error');
});

// ============================================
// Test Suite: validateParams
// ============================================
console.log('\n📝 validateParams - Route Parameters\n');

test('Should validate valid route parameters', () => {
  const schema = Joi.object({
    id: Joi.string().required()
  });

  const req = createMockReq({}, {}, { id: '123' });
  const res = createMockRes();
  const next = createNext();

  validateParams(schema)(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.params.id === '123', 'ID should be in params');
});

test('Should return 422 for missing required parameter', () => {
  const schema = Joi.object({
    id: Joi.string().required()
  });

  const req = createMockReq({}, {}, {});
  const res = createMockRes();
  const next = createNext();

  validateParams(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(res.body.error.code === 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  assert(res.body.error.details.id, 'Should have id error');
});

// ============================================
// Test Suite: Generic validate Function
// ============================================
console.log('\n📝 Generic validate Function\n');

test('Should validate body when source is "body"', () => {
  const schema = Joi.object({
    name: Joi.string().required()
  });

  const req = createMockReq({ name: 'Test' });
  const res = createMockRes();
  const next = createNext();

  validate(schema, 'body')(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.body.name === 'Test', 'Name should be in body');
});

test('Should validate query when source is "query"', () => {
  const schema = Joi.object({
    search: Joi.string().required()
  });

  const req = createMockReq({}, { search: 'test' }, {});
  const res = createMockRes();
  const next = createNext();

  validate(schema, 'query')(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.query.search === 'test', 'Search should be in query');
});

test('Should validate params when source is "params"', () => {
  const schema = Joi.object({
    userId: Joi.string().required()
  });

  const req = createMockReq({}, {}, { userId: '456' });
  const res = createMockRes();
  const next = createNext();

  validate(schema, 'params')(req, res, next);

  assert(next.wasCalled(), 'next() should be called');
  assert(req.params.userId === '456', 'UserId should be in params');
});

// ============================================
// Test Suite: Actionable Error Messages
// ============================================
console.log('\n📝 Actionable Error Messages\n');

test('Error messages should be actionable', () => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    })
  });

  const req = createMockReq({ email: 'bad-email' });
  const res = createMockRes();
  const next = createNext();

  validateBody(schema)(req, res, next);

  assert(res.statusCode === 422, 'Status should be 422');
  assert(res.body.error.details.email, 'Should have email error');
  assert(res.body.error.details.email.includes('valid email'), 'Error should be actionable');
  assert(res.body.error.details.password, 'Should have password error');
  assert(res.body.error.details.password.includes('required'), 'Error should be actionable');
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
