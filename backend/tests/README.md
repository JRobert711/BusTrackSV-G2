# Testing Documentation

Comprehensive testing suite for BusTrack SV Backend using Jest.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Firestore Emulator Setup](#firestore-emulator-setup)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)

## Overview

The testing suite includes:
- **Unit Tests**: Test individual components in isolation (models, services)
- **Integration Tests**: Test components with real Firestore Emulator (repositories)

## Test Structure

```
tests/
├── setup.js                      # Global Jest setup
├── unit/
│   ├── models/
│   │   ├── User.test.js         # User model validation
│   │   └── Bus.test.js          # Bus model validation
│   └── services/
│       └── userService.test.js  # User service logic
└── integration/
    └── repositories/
        ├── setup.js              # Emulator setup
        ├── userRepository.test.js
        └── busRepository.test.js
```

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy test environment file:**
   ```bash
   cp .env.test.example .env.test
   ```

3. **For integration tests, start Firestore Emulator** (see section below)

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |

### Examples

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode (auto-rerun on changes):**
```bash
npm run test:watch
```

**Run unit tests only:**
```bash
npm run test:unit
```

**Run integration tests only (requires emulator):**
```bash
npm run test:integration
```

**Generate coverage report:**
```bash
npm run test:coverage
```

## Firestore Emulator Setup

Integration tests require the Firestore Emulator to avoid hitting production database and incurring costs.

### Installation

**Option 1: Using Firebase CLI (Recommended)**

1. **Install Firebase Tools:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not already done):**
   ```bash
   firebase init emulators
   ```
   
   Select:
   - ✓ Firestore Emulator
   - Port: 8080 (default)

### Starting the Emulator

**Start emulator in a separate terminal:**
```bash
firebase emulators:start --only firestore
```

**Or start with UI:**
```bash
firebase emulators:start --only firestore
```

The emulator will run on `localhost:8080` (default).

### Emulator UI

Access the emulator UI at: http://localhost:4000

From the UI you can:
- View collections and documents
- Inspect test data
- Clear data between test runs

### Verifying Emulator

Check if the emulator is running:
```bash
curl http://localhost:8080
```

You should see the emulator welcome page.

### Environment Configuration

The test setup automatically connects to the emulator using:
```javascript
// tests/integration/repositories/setup.js
db.settings({
  host: 'localhost:8080',
  ssl: false
});
```

**Environment variable** (in `.env.test`):
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Automated Emulator Startup (Optional)

Add to `package.json`:
```json
{
  "scripts": {
    "emulator": "firebase emulators:start --only firestore",
    "test:integration:full": "firebase emulators:exec --only firestore 'npm run test:integration'"
  }
}
```

Then run:
```bash
npm run test:integration:full
```

This automatically starts the emulator, runs tests, and stops the emulator.

## Writing Tests

### Unit Test Example

```javascript
// tests/unit/models/User.test.js
describe('User Model', () => {
  test('should create valid user', () => {
    const user = new User({
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: 'hashed'
    });

    expect(user.email).toBe('test@example.com');
  });

  test('should throw error for invalid email', () => {
    expect(() => {
      new User({
        email: 'invalid-email',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed'
      });
    }).toThrow('Invalid email format');
  });
});
```

### Integration Test Example

```javascript
// tests/integration/repositories/userRepository.test.js
describe('UserRepository Integration', () => {
  beforeEach(async () => {
    // Clean collection before each test
    await clearCollection(db, 'users');
  });

  test('should create user in Firestore', async () => {
    const user = new User({
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: 'hashed'
    });

    const created = await userRepository.create(user);

    expect(created.id).toBeDefined();
    expect(created.email).toBe('test@example.com');
  });
});
```

### Service Test with Mocks Example

```javascript
// tests/unit/services/userService.test.js
jest.mock('../../../src/services/userRepository');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register user with valid data', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);

    const result = await userService.register(userData);

    expect(result).toHaveProperty('token');
  });
});
```

## Coverage

### Viewing Coverage Reports

After running `npm run test:coverage`, coverage reports are generated in:

- **Console**: Summary in terminal
- **HTML**: `coverage/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI/CD tools)

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50
  }
}
```

Tests will fail if coverage drops below these thresholds.

### Improving Coverage

1. **Check uncovered lines:**
   ```bash
   npm run test:coverage
   # Open coverage/index.html in browser
   ```

2. **Add tests for uncovered code**

3. **Focus on critical paths:**
   - Model validation
   - Service business logic
   - Repository CRUD operations

## Best Practices

### General

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clear data between tests
3. **Descriptive names**: Use clear test descriptions
4. **One assertion**: Test one thing at a time (when possible)
5. **Fast**: Keep tests fast (< 5s per test suite)

### Unit Tests

1. **Mock external dependencies**: Don't hit real databases/APIs
2. **Test edge cases**: Empty strings, null values, boundary conditions
3. **Test validation**: Ensure models throw errors for invalid data

### Integration Tests

1. **Use emulator**: Never test against production database
2. **Clean between tests**: Use `beforeEach` to clear collections
3. **Test real flows**: Test actual CRUD operations
4. **Verify timestamps**: Check createdAt/updatedAt fields

## Troubleshooting

### Emulator Not Running

**Error:**
```
Error: Could not reach Firestore backend
```

**Solution:**
Start the emulator in a separate terminal:
```bash
firebase emulators:start --only firestore
```

### Port Already in Use

**Error:**
```
Port 8080 is already in use
```

**Solution:**
Stop the process using port 8080 or configure a different port:

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### Tests Failing After Code Changes

1. **Check test logs** for specific errors
2. **Update mocks** if function signatures changed
3. **Clear jest cache**: `jest --clearCache`
4. **Restart watch mode**: Ctrl+C and restart

### Coverage Not Updating

1. **Delete coverage folder**: `rm -rf coverage`
2. **Clear jest cache**: `jest --clearCache`
3. **Run coverage again**: `npm run test:coverage`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Install Firebase Tools
        run: npm install -g firebase-tools
      
      - name: Run integration tests with emulator
        run: |
          firebase emulators:exec --only firestore \
            'npm run test:integration'
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
