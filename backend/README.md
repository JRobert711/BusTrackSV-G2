# BusTrack SV - Backend API

[![CI](https://github.com/JRobert711/BusTrackSV-G2/actions/workflows/ci.yml/badge.svg)](https://github.com/JRobert711/BusTrackSV-G2/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/JRobert711/BusTrackSV-G2/branch/main/graph/badge.svg)](https://codecov.io/gh/JRobert711/BusTrackSV-G2)

RESTful API backend for BusTrack SV, built with Node.js and Express.

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Firebase (Firestore)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Password Hashing**: bcrypt
- **Security**: express-rate-limit, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Environment config, Firebase, JWT settings
│   ├── controllers/    # HTTP request handlers (thin layer)
│   ├── models/         # OOP entities with getters/setters
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic layer (use-cases)
│   ├── utils/          # JWT helpers, validators, utilities
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env.example        # Environment variables template
├── .eslintrc.json      # ESLint configuration
├── .gitignore          # Git ignore rules
├── .nvmrc              # Node version specification
├── .prettierrc         # Prettier configuration (optional)
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0 (check with `node -v`)
- npm >= 9.0.0 (check with `npm -v`)
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd BusTrackSV-G2/backend
   ```

2. **Use correct Node version** (if using nvm):
   ```bash
   nvm use
   ```
   This will automatically use the Node version specified in `.nvmrc`.

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

   Then edit `.env` and fill in your actual values:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_actual_secret_key_here
   FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-adminsdk.json
   # ... and other variables
   ```

5. **Configure Firebase**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-adminsdk.json` in `src/config/`
   - Update the path in `.env` if needed

### Running the Server

#### Development mode (with auto-reload):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT you specified in `.env`).

### Database Seeding (Development Only)

⚠️ **DEVELOPMENT ONLY** - Do not run seed script in production!

To populate the database with sample data for testing:

```bash
npm run seed
```

**What it does:**
- Creates an admin user (idempotent - won't duplicate)
  - Email: `admin@bustrack.com`
  - Password: `Admin123!@#`
- Creates 5 sample buses with varied status and routes

**Idempotency:**
The seed script is safe to run multiple times. It checks for existing data before inserting:
- Admin user: Checks by email
- Buses: Checks by license plate

**After seeding:**
1. Login with the admin credentials
2. Get a JWT token from the response
3. Use the token to access protected endpoints

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bustrack.com","password":"Admin123!@#"}'

# Get buses (use token from login response)
curl -X GET http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer <your-token>"
```

**Safety:** The seed script will refuse to run if `NODE_ENV=production`.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm test` | Run all tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests (requires emulator) |
| `npm run seed` | Seed database with sample data (development only) |

## 🔒 Environment Variables

See `.env.example` for a complete list of required environment variables:

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT token generation
- `CORS_ORIGIN` - Allowed origin for CORS
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase credentials
- And more...

## 📝 Code Standards

This project enforces strict code quality:

- **ESLint**: Enforces code style and catches common errors
- **Prettier** (optional): Auto-formats code
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants

### Before committing:

```bash
npm run lint:fix
```

## 🏗 Architecture Principles

1. **Separation of Concerns**:
   - **Controllers**: Thin HTTP adapters (parse request, call service, format response)
   - **Services**: Business logic and use-cases
   - **Models**: OOP entities with encapsulation
   - **Utils**: Pure helper functions

2. **Clean Code**:
   - Single Responsibility Principle
   - No business logic in controllers
   - Use dependency injection where applicable
   - Prefer composition over inheritance

3. **Error Handling**:
   - Centralized error handler in `app.js`
   - Custom error classes in `utils/`
   - Always return proper HTTP status codes

## 🧪 Testing

This project uses Jest for comprehensive testing.

### Test Structure

- **Unit Tests**: Models and services (no external dependencies)
- **Integration Tests**: Repositories against Firestore Emulator

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests (requires emulator)
npm run test:integration
```

### Firestore Emulator Setup

Integration tests use the Firestore Emulator to avoid production database costs.

**1. Install Firebase Tools:**
```bash
npm install -g firebase-tools
```

**2. Initialize emulators (first time only):**
```bash
firebase init emulators
```
Select Firestore Emulator, use default port 8080.

**3. Start emulator (in separate terminal):**
```bash
firebase emulators:start --only firestore
```

**4. Run integration tests:**
```bash
npm run test:integration
```

The emulator UI is available at: http://localhost:4000

### Test Coverage

Coverage reports are generated in `coverage/` directory:
- Open `coverage/index.html` in browser for detailed report
- Terminal shows coverage summary after running `npm run test:coverage`

**Current Thresholds:**
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

For detailed testing documentation, see [tests/README.md](./tests/README.md)

## 🔄 Continuous Integration

This project uses GitHub Actions for automated CI/CD.

### CI Pipeline

The CI workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Pipeline stages:**
1. **Lint** - ESLint code quality check
2. **Test** - Run all tests with coverage
3. **Build** - Verify build process (main branch only)

### Workflow Jobs

**Lint Job:**
- Runs ESLint on all source files
- Fails if code quality issues found
- Uses npm cache for faster runs

**Test Job:**
- Runs unit tests
- Runs integration tests with Firestore Emulator
- Generates coverage report
- Uploads coverage to Codecov
- Fails if tests fail or coverage drops

**Build Job (Optional):**
- Only runs on push to main
- Verifies dependencies install correctly
- Shows build summary

### Viewing CI Status

- **Badge**: See build status at top of README
- **Actions Tab**: View detailed workflow runs
- **PR Checks**: CI must pass before merge

### Local Verification

Before pushing, verify CI will pass:

```bash
# Run lint
npm run lint

# Run tests
npm test

# Check coverage
npm run test:coverage
```

For more details, see [.github/workflows/README.md](../.github/workflows/README.md)

## 🐛 Troubleshooting

### Port already in use
```bash
# Find and kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Firebase connection issues
- Verify your service account JSON file path
- Check Firebase rules in console
- Ensure Firestore is enabled

### Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📖 API Documentation

This project includes a complete OpenAPI 3.1 specification.

### OpenAPI Spec

**File**: `openapi.yaml`

The specification documents all endpoints with:
- Request/response schemas
- Authentication requirements
- Validation rules
- Error responses
- Example requests and responses

### Viewing Documentation

**Option 1: Swagger Editor (Online)**
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. File → Import file → Select `openapi.yaml`
3. View formatted documentation

**Option 2: Local Swagger UI**
```bash
npm install swagger-ui-express yamljs
```

Then visit: http://localhost:5000/api-docs (when implemented)

### API Endpoints

**Authentication** (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Authenticate user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile (requires auth)

**Buses** (`/api/v1/buses`)
- `GET /buses` - List buses (paginated, with filters)
- `GET /buses/:id` - Get single bus
- `POST /buses` - Create bus (admin only)
- `PATCH /buses/:id` - Update bus (admin only)
- `PATCH /buses/:id/favorite` - Toggle favorite (authenticated)
- `DELETE /buses/:id` - Delete bus (admin only)
- `PATCH /buses/:id/position` - Update GPS position (admin only)

**Health Checks**
- `GET /health` - Service health status
- `GET /ready` - Service readiness status

**GPS Data Ingestion** (Reserved - Not Implemented)
- `POST /gps/ingest` - Ingest GPS data from tracking devices (returns 501)

For detailed documentation, see [`OPENAPI.md`](./OPENAPI.md)

### 🚧 Reserved Endpoints

#### GPS Data Ingestion

**Endpoint:** `POST /api/v1/gps/ingest`  
**Status:** Reserved for future implementation (currently returns 501 Not Implemented)

This endpoint is reserved for real-time GPS data ingestion from tracking devices installed on buses.

**Payload Schema:**
```json
{
  "busId": "bus123",
  "deviceId": "device-001",
  "timestamp": "2024-01-01T12:30:45.123Z",
  "lat": 13.6929,
  "lng": -89.2182,
  "speed": 45.5,
  "heading": 180,
  "accuracy": 5.2
}
```

**Planned Implementation Features:**

**1. Deduplication Strategy**
- **Key:** `deviceId` + `timestamp`
- **Purpose:** Prevent duplicate GPS readings from being stored
- **Implementation:** Use composite key in Firestore or check before insert
- **Behavior:** If duplicate detected, return 200 OK (idempotent)

**2. Rate Limiting**
- **Limit:** ~1 Hz per device (1 reading per second per device)
- **Type:** Per-device sliding window rate limit
- **Purpose:** Prevent device flooding and reduce storage costs
- **Behavior:** If rate exceeded, return 429 Too Many Requests
- **Headers:** 
  - `X-RateLimit-Limit: 1`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: <timestamp>`

**3. Data Retention**
- **TTL:** 30 days
- **Implementation:** Firestore TTL using `expiresAt` field
- **Formula:** `expiresAt = timestamp + 30 days`
- **Cleanup:** Automatic via Firestore TTL policies
- **Purpose:** Comply with data retention policies and reduce storage costs

**4. Validation**
- Validate `busId` exists in buses collection
- Validate `deviceId` format (alphanumeric + dashes)
- Validate `timestamp` is not in the future (max 5 min skew)
- Validate GPS coordinates (lat: -90 to 90, lng: -180 to 180)
- Validate optional fields (speed >= 0, heading: 0-360, accuracy >= 0)

**5. Real-time Updates**
- Update bus position in `buses` collection
- Broadcast position update to connected clients (WebSocket/SSE)
- Update `lastSeen` timestamp on bus document

**Future Collection Structure:**
```javascript
// Firestore collection: gps_readings
{
  id: "auto-generated",
  busId: "bus123",
  deviceId: "device-001", 
  timestamp: Timestamp,
  position: {
    lat: 13.6929,
    lng: -89.2182
  },
  speed: 45.5,        // km/h
  heading: 180,       // degrees
  accuracy: 5.2,      // meters
  expiresAt: Timestamp,  // timestamp + 30 days (for TTL)
  createdAt: Timestamp
}
```

**Firestore Index Requirements:**
```javascript
// Composite indexes needed:
// 1. deviceId + timestamp (for deduplication)
// 2. busId + timestamp DESC (for querying recent positions)
// 3. expiresAt ASC (for TTL cleanup)
```

**Implementation Checklist:**
- [ ] Create `gps_readings` Firestore collection
- [ ] Implement deduplication logic (deviceId + timestamp check)
- [ ] Add per-device rate limiting middleware (~1 Hz)
- [ ] Set up Firestore TTL policy with `expiresAt` field
- [ ] Add GPS data validation
- [ ] Update bus position in `buses` collection
- [ ] Add Firestore composite indexes
- [ ] Implement real-time broadcasting (WebSocket/SSE)
- [ ] Add monitoring and alerting
- [ ] Update OpenAPI spec with 200/201 responses
- [ ] Add integration tests with emulator

**Why Not Implemented Yet:**
- Requires careful planning for high-frequency data ingestion
- Need to set up Firestore indexes before launch
- Rate limiting strategy needs testing at scale
- Real-time broadcasting infrastructure not yet built

**When to Implement:**
- After core CRUD operations are stable
- When device integration is ready
- After load testing infrastructure is in place

## ✅ Manual QA Testing

Complete manual testing checklist to verify all API flows work correctly.

### Prerequisites

1. **Start server:** `npm run dev`
2. **Seed database:** `npm run seed`
3. **Verify health:** `curl http://localhost:5000/health`

**Seeded Admin:**
- Email: `admin@bustrack.com`
- Password: `Admin123!@#`
- Role: `admin`

### Test Flows

#### 1. Register → 201 Created

**Register Supervisor:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supervisor@bustrack.com",
    "name": "Test Supervisor",
    "password": "Super123!@#",
    "role": "supervisor"
  }'
```

**✓ Expected:** `201 Created` with user object (no passwordHash), token, and refreshToken

**Save supervisor token for later tests!**

#### 2. Login → 200 OK with Token

**Login as Admin:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bustrack.com",
    "password": "Admin123!@#"
  }'
```

**✓ Expected:** `200 OK` with user object, token, and refreshToken

**Save admin token:** `export ADMIN_TOKEN="<token-from-response>"`

#### 3. List Buses (Authenticated) → 200 OK

**Get all buses:**
```bash
curl -X GET http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**✓ Expected:** `200 OK` with data array (5 buses from seed) and pagination metadata

#### 4. Create Bus (Admin) → 201 Created

**Create new bus:**
```bash
curl -X POST http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "P-999999",
    "unitName": "Test Bus 999",
    "status": "parked",
    "route": "Test Route"
  }'
```

**✓ Expected:** `201 Created` with bus object, license plate uppercase

**Save bus ID:** `export BUS_ID="<id-from-response>"`

#### 5. Create Bus (Supervisor) → 403 Forbidden

**Try to create as supervisor:**
```bash
curl -X POST http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "P-888888",
    "unitName": "Forbidden Bus",
    "status": "parked"
  }'
```

**✓ Expected:** `403 Forbidden` with error envelope:
```json
{
  "error": "Access denied. Admin role required.",
  "type": "FORBIDDEN"
}
```

#### 6. Update Bus (Admin) → 200 OK

**Update bus:**
```bash
curl -X PATCH http://localhost:5000/api/v1/buses/$BUS_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unitName": "Updated Test Bus",
    "status": "moving"
  }'
```

**✓ Expected:** `200 OK` with updated bus object

#### 7. Update Bus (Supervisor) → 403 Forbidden

**Try to update as supervisor:**
```bash
curl -X PATCH http://localhost:5000/api/v1/buses/$BUS_ID \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"unitName": "Unauthorized Update"}'
```

**✓ Expected:** `403 Forbidden` with error envelope

#### 8. Toggle Favorite (Supervisor) → 200 OK

**Supervisor can toggle favorite:**
```bash
curl -X PATCH http://localhost:5000/api/v1/buses/$BUS_ID/favorite \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
```

**✓ Expected:** `200 OK` with isFavorite toggled

#### 9. Delete Bus (Admin) → 204 No Content

**Delete bus:**
```bash
curl -X DELETE http://localhost:5000/api/v1/buses/$BUS_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**✓ Expected:** `204 No Content` (no response body)

#### 10. Delete Bus (Supervisor) → 403 Forbidden

**Get another bus ID first, then:**
```bash
curl -X DELETE http://localhost:5000/api/v1/buses/<ANOTHER_BUS_ID> \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
```

**✓ Expected:** `403 Forbidden` with error envelope

### Error Envelope Validation

All errors must follow the standard envelope format:

**Standard Error (401, 403, 404, 409, 500):**
```json
{
  "error": "Error message",
  "type": "ERROR_TYPE"
}
```

**Validation Error (422):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "error description"
    }
  }
}
```

#### Test: 401 Unauthorized (No Token)
```bash
curl -X GET http://localhost:5000/api/v1/buses
```

**✓ Expected:** `401 Unauthorized`
```json
{
  "error": "No token provided",
  "type": "UNAUTHORIZED"
}
```

#### Test: 401 Unauthorized (Invalid Token)
```bash
curl -X GET http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer invalid_token"
```

**✓ Expected:** `401 Unauthorized`
```json
{
  "error": "Invalid or malformed token",
  "type": "TOKEN_INVALID"
}
```

#### Test: 403 Forbidden (Wrong Role)
```bash
curl -X POST http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"TEST","unitName":"Test","status":"parked"}'
```

**✓ Expected:** `403 Forbidden`
```json
{
  "error": "Access denied. Admin role required.",
  "type": "FORBIDDEN"
}
```

#### Test: 404 Not Found (Invalid Route)
```bash
curl -X GET http://localhost:5000/api/v1/invalid/route
```

**✓ Expected:** `404 Not Found`
```json
{
  "error": "Route GET /api/v1/invalid/route not found",
  "type": "NOT_FOUND"
}
```

#### Test: 404 Not Found (Non-existent Bus)
```bash
curl -X GET http://localhost:5000/api/v1/buses/nonexistent_id \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**✓ Expected:** `404 Not Found`
```json
{
  "error": "Bus not found",
  "type": "NOT_FOUND"
}
```

#### Test: 409 Conflict (Duplicate Email)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bustrack.com",
    "name": "Duplicate",
    "password": "Test123!@#",
    "role": "admin"
  }'
```

**✓ Expected:** `409 Conflict`
```json
{
  "error": "Email already in use",
  "type": "CONFLICT"
}
```

#### Test: 422 Validation Error (Invalid Email)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "Test",
    "password": "Test123!@#",
    "role": "admin"
  }'
```

**✓ Expected:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": "Email must be a valid email address"
    }
  }
}
```

### QA Checklist Summary

- [ ] **Health checks** return 200 OK
- [ ] **Register** returns 201 with tokens (no passwordHash in response)
- [ ] **Login** returns 200 with tokens
- [ ] **List buses (auth)** returns 200 with data and pagination
- [ ] **Create bus (admin)** returns 201 Created
- [ ] **Create bus (supervisor)** returns 403 Forbidden
- [ ] **Update bus (admin)** returns 200 OK
- [ ] **Update bus (supervisor)** returns 403 Forbidden
- [ ] **Toggle favorite (supervisor)** returns 200 OK (allowed)
- [ ] **Toggle favorite (admin)** returns 200 OK (allowed)
- [ ] **Delete bus (admin)** returns 204 No Content
- [ ] **Delete bus (supervisor)** returns 403 Forbidden
- [ ] **401 errors** follow standard envelope format
- [ ] **403 errors** follow standard envelope format
- [ ] **404 errors** follow standard envelope format
- [ ] **409 errors** follow standard envelope format
- [ ] **422 errors** follow validation envelope format
- [ ] **All auth flows** work with seeded admin credentials
- [ ] **No stack traces** in error responses (production mode)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [JWT.io](https://jwt.io/)
- [Joi Validation](https://joi.dev/api/)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)

## 👥 Contributing

1. Follow the established folder structure
2. Run linter before committing: `npm run lint:fix`
3. Write meaningful commit messages
4. Keep functions small and focused
5. Add comments for complex logic

## 📄 License

ISC
