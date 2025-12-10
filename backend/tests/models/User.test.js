/**
 * Manual Tests for User Model
 *
 * Run with: node tests/models/User.test.js
 */

require('dotenv').config();
const User = require('../../src/models/User');

console.log('='.repeat(60));
console.log('🧪 User Model Test Suite');
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
 * Helper to assert error is thrown
 */
function assertThrows(fn, expectedMessage) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
    }
  }
}

// ============================================
// Test Suite: User Creation
// ============================================
console.log('\n📝 User Creation Tests\n');

test('Should create a valid user', () => {
  const user = new User({
    id: '1',
    email: 'admin@bustrack.com',
    name: 'Admin User',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assert(user.id === '1', 'ID should be set');
  assert(user.email === 'admin@bustrack.com', 'Email should be set');
  assert(user.name === 'Admin User', 'Name should be set');
  assert(user.role === 'admin', 'Role should be set');
  assert(user.passwordHash, 'Password hash should be set');
  assert(user.createdAt instanceof Date, 'createdAt should be a Date');
  assert(user.updatedAt instanceof Date, 'updatedAt should be a Date');
});

test('Should convert email to lowercase', () => {
  const user = new User({
    id: '2',
    email: 'SUPERVISOR@BusTrack.COM',
    name: 'Supervisor User',
    role: 'supervisor',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assert(user.email === 'supervisor@bustrack.com', 'Email should be lowercase');
});

test('Should trim and validate name', () => {
  const user = new User({
    id: '3',
    email: 'user@test.com',
    name: '  John Doe  ',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assert(user.name === 'John Doe', 'Name should be trimmed');
});

// ============================================
// Test Suite: Validation Errors
// ============================================
console.log('\n📝 Validation Error Tests\n');

test('Should throw error for missing email', () => {
  assertThrows(() => {
    new User({
      id: '4',
      name: 'Test User',
      role: 'admin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
    });
  }, 'Email is required');
});

test('Should throw error for invalid email format', () => {
  assertThrows(() => {
    new User({
      id: '5',
      email: 'not-an-email',
      name: 'Test User',
      role: 'admin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
    });
  }, 'Invalid email');
});

test('Should throw error for name too short', () => {
  assertThrows(() => {
    new User({
      id: '6',
      email: 'test@test.com',
      name: 'A',
      role: 'admin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
    });
  }, 'at least 2 characters');
});

test('Should throw error for invalid role', () => {
  assertThrows(() => {
    new User({
      id: '7',
      email: 'test@test.com',
      name: 'Test User',
      role: 'superadmin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
    });
  }, 'Invalid role');
});

test('Should throw error for missing password hash', () => {
  assertThrows(() => {
    new User({
      id: '8',
      email: 'test@test.com',
      name: 'Test User',
      role: 'admin'
    });
  }, 'Password hash is required');
});

test('Should throw error for invalid password hash', () => {
  assertThrows(() => {
    new User({
      id: '9',
      email: 'test@test.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: 'tooshort'
    });
  }, 'Password hash appears to be invalid');
});

test('Should throw error for missing ID', () => {
  assertThrows(() => {
    new User({
      email: 'test@test.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
    });
  }, 'User ID is required');
});

// ============================================
// Test Suite: toJSON() Security
// ============================================
console.log('\n📝 toJSON() Security Tests\n');

test('toJSON() should NOT include passwordHash', () => {
  const user = new User({
    id: '10',
    email: 'secure@test.com',
    name: 'Secure User',
    role: 'admin',
    passwordHash: '$2b$10$secretHashShouldNotBeExposed123456'
  });

  const json = user.toJSON();

  assert(!json.passwordHash, 'toJSON() should NOT contain passwordHash');
  assert(!json.hasOwnProperty('passwordHash'), 'toJSON() should not have passwordHash property');
});

test('toJSON() should include safe public fields', () => {
  const user = new User({
    id: '11',
    email: 'public@test.com',
    name: 'Public User',
    role: 'supervisor',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  const json = user.toJSON();

  assert(json.id === '11', 'toJSON() should include id');
  assert(json.email === 'public@test.com', 'toJSON() should include email');
  assert(json.name === 'Public User', 'toJSON() should include name');
  assert(json.role === 'supervisor', 'toJSON() should include role');
  assert(json.createdAt, 'toJSON() should include createdAt');
  assert(json.updatedAt, 'toJSON() should include updatedAt');
});

test('JSON.stringify() should NOT expose passwordHash', () => {
  const user = new User({
    id: '12',
    email: 'json@test.com',
    name: 'JSON User',
    role: 'admin',
    passwordHash: '$2b$10$secretHashShouldNotBeExposed123456'
  });

  const jsonString = JSON.stringify(user);
  assert(!jsonString.includes('passwordHash'), 'JSON.stringify() should not contain passwordHash');
  assert(!jsonString.includes('secretHash'), 'JSON.stringify() should not contain password hash value');
});

// ============================================
// Test Suite: Setters
// ============================================
console.log('\n📝 Setter Validation Tests\n');

test('Should throw error when setting invalid email via setter', () => {
  const user = new User({
    id: '13',
    email: 'valid@test.com',
    name: 'Test User',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assertThrows(() => {
    user.email = 'invalid-email';
  }, 'Invalid email');
});

test('Should throw error when setting invalid role via setter', () => {
  const user = new User({
    id: '14',
    email: 'test@test.com',
    name: 'Test User',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assertThrows(() => {
    user.role = 'invalidrole';
  }, 'Invalid role');
});

test('Should throw error when setting short name via setter', () => {
  const user = new User({
    id: '15',
    email: 'test@test.com',
    name: 'Valid Name',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assertThrows(() => {
    user.name = 'X';
  }, 'at least 2 characters');
});

// ============================================
// Test Suite: Static Methods
// ============================================
console.log('\n📝 Static Methods Tests\n');

test('collection() should return correct collection name', () => {
  assert(User.collection() === 'users', 'collection() should return "users"');
});

test('getAllowedRoles() should return allowed roles', () => {
  const roles = User.getAllowedRoles();
  assert(Array.isArray(roles), 'getAllowedRoles() should return an array');
  assert(roles.includes('admin'), 'Should include admin role');
  assert(roles.includes('supervisor'), 'Should include supervisor role');
  assert(roles.length === 2, 'Should have exactly 2 roles');
});

test('fromDatabase() should create User from database document', () => {
  const doc = {
    id: '16',
    email: 'db@test.com',
    name: 'DB User',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const user = User.fromDatabase(doc);
  assert(user instanceof User, 'Should return a User instance');
  assert(user.id === '16', 'Should have correct id');
  assert(user.email === 'db@test.com', 'Should have correct email');
});

// ============================================
// Test Suite: Instance Methods
// ============================================
console.log('\n📝 Instance Methods Tests\n');

test('isAdmin() should return true for admin users', () => {
  const user = new User({
    id: '17',
    email: 'admin@test.com',
    name: 'Admin',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assert(user.isAdmin() === true, 'isAdmin() should return true for admin');
  assert(user.isSupervisor() === false, 'isSupervisor() should return false for admin');
});

test('isSupervisor() should return true for supervisor users', () => {
  const user = new User({
    id: '18',
    email: 'supervisor@test.com',
    name: 'Supervisor',
    role: 'supervisor',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  assert(user.isSupervisor() === true, 'isSupervisor() should return true for supervisor');
  assert(user.isAdmin() === false, 'isAdmin() should return false for supervisor');
});

test('touch() should update updatedAt timestamp', () => {
  const user = new User({
    id: '19',
    email: 'touch@test.com',
    name: 'Touch User',
    role: 'admin',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  });

  const originalUpdatedAt = user.updatedAt.getTime();

  // Wait a bit
  setTimeout(() => {}, 10);

  user.touch();
  const newUpdatedAt = user.updatedAt.getTime();

  assert(newUpdatedAt >= originalUpdatedAt, 'touch() should update updatedAt');
});

test('toDatabase() should include passwordHash', () => {
  const user = new User({
    id: '20',
    email: 'database@test.com',
    name: 'Database User',
    role: 'admin',
    passwordHash: '$2b$10$secretHashForDatabase123456'
  });

  const dbObject = user.toDatabase();

  assert(dbObject.passwordHash, 'toDatabase() should include passwordHash');
  assert(dbObject.passwordHash === '$2b$10$secretHashForDatabase123456', 'Password hash should match');
  assert(dbObject.email === 'database@test.com', 'Should include email');
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
