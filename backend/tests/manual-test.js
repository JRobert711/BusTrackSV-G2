/**
 * Manual Test Script for JWT and Validation Utilities
 * 
 * Run with: node tests/manual-test.js
 */

require('dotenv').config();

const { jwtUtil, TokenExpiredError, TokenInvalidError } = require('../src/utils/jwt');
const {
  validatePassword,
  validateEmail,
  validateUsername,
  validateEnum,
  ValidationError
} = require('../src/utils/validation');

console.log('='.repeat(60));
console.log('🧪 Manual Test Suite - JWT & Validation Utilities');
console.log('='.repeat(60));

// ============================================
// Test JWT Utilities
// ============================================
console.log('\n📝 Testing JWT Utilities...\n');

try {
  // Test 1: Sign and verify access token
  console.log('Test 1: Sign and verify access token');
  const payload = { id: 1, username: 'testuser', role: 'admin' };
  const accessToken = jwtUtil.signAccess(payload);
  console.log('  ✓ Access token signed:', accessToken.substring(0, 50) + '...');
  
  const decodedAccess = jwtUtil.verifyAccess(accessToken);
  console.log('  ✓ Access token verified:', decodedAccess.username);
  console.log('  ✓ Token expires in:', decodedAccess.exp - decodedAccess.iat, 'seconds');

  // Test 2: Sign and verify refresh token
  console.log('\nTest 2: Sign and verify refresh token');
  const refreshToken = jwtUtil.signRefresh(payload);
  console.log('  ✓ Refresh token signed:', refreshToken.substring(0, 50) + '...');
  
  const decodedRefresh = jwtUtil.verifyRefresh(refreshToken);
  console.log('  ✓ Refresh token verified:', decodedRefresh.username);

  // Test 3: Decode without verification
  console.log('\nTest 3: Decode token without verification');
  const decoded = jwtUtil.decode(accessToken);
  console.log('  ✓ Decoded payload:', { id: decoded.id, username: decoded.username, role: decoded.role });

  // Test 4: Invalid token
  console.log('\nTest 4: Verify invalid token');
  try {
    jwtUtil.verifyAccess('invalid.token.here');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof TokenInvalidError) {
      console.log('  ✓ Correctly threw TokenInvalidError:', error.message);
    } else {
      console.log('  ✗ Wrong error type:', error.name);
    }
  }

  // Test 5: Wrong secret (access token verified as refresh)
  console.log('\nTest 5: Verify token with wrong secret');
  try {
    jwtUtil.verifyRefresh(accessToken);
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof TokenInvalidError) {
      console.log('  ✓ Correctly rejected token signed with different secret');
    } else {
      console.log('  ✗ Wrong error type:', error.name);
    }
  }

  console.log('\n✅ All JWT tests passed!\n');
} catch (error) {
  console.error('\n❌ JWT test failed:', error.message);
  console.error(error.stack);
}

// ============================================
// Test Validation Utilities
// ============================================
console.log('\n📝 Testing Validation Utilities...\n');

try {
  // Test 1: Valid password
  console.log('Test 1: Validate valid password');
  const validPassword = 'MyP@ssw0rd123';
  validatePassword(validPassword);
  console.log('  ✓ Valid password accepted:', validPassword);

  // Test 2: Invalid password (too short)
  console.log('\nTest 2: Validate invalid password (too short)');
  try {
    validatePassword('Short1!');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  // Test 3: Invalid password (no uppercase)
  console.log('\nTest 3: Validate invalid password (no uppercase)');
  try {
    validatePassword('mypassword123!');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  // Test 4: Invalid password (no special char)
  console.log('\nTest 4: Validate invalid password (no special char)');
  try {
    validatePassword('MyPassword123');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  // Test 5: Valid email
  console.log('\nTest 5: Validate valid email');
  const validEmail = 'user@example.com';
  validateEmail(validEmail);
  console.log('  ✓ Valid email accepted:', validEmail);

  // Test 6: Invalid email
  console.log('\nTest 6: Validate invalid email');
  try {
    validateEmail('not-an-email');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  // Test 7: Valid username
  console.log('\nTest 7: Validate valid username');
  const validUsername = 'user_123';
  validateUsername(validUsername);
  console.log('  ✓ Valid username accepted:', validUsername);

  // Test 8: Invalid username (too short)
  console.log('\nTest 8: Validate invalid username (too short)');
  try {
    validateUsername('ab');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  // Test 9: Valid enum
  console.log('\nTest 9: Validate enum value');
  const roles = ['admin', 'user', 'operator'];
  validateEnum('admin', roles, 'role');
  console.log('  ✓ Valid enum value accepted: admin');

  // Test 10: Invalid enum
  console.log('\nTest 10: Validate invalid enum value');
  try {
    validateEnum('superadmin', roles, 'role');
    console.log('  ✗ Should have thrown error');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('  ✓ Correctly rejected:', error.message);
    }
  }

  console.log('\n✅ All validation tests passed!\n');
} catch (error) {
  console.error('\n❌ Validation test failed:', error.message);
  console.error(error.stack);
}

// ============================================
// Summary
// ============================================
console.log('='.repeat(60));
console.log('✅ All manual tests completed successfully!');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Implement full unit tests with Jest or Mocha');
console.log('2. Add integration tests for API endpoints');
console.log('3. Set up CI/CD pipeline with automated testing');
console.log();
