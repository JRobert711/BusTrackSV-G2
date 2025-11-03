# Models

This directory contains OOP entity models with getters/setters for domain entities.

## 📋 Purpose

Models represent domain entities with:
- **Proper encapsulation** using JavaScript private fields (`#`)
- **Validation** in constructors and setters
- **Getters/setters** for controlled access
- **No business logic** (that belongs in services)
- **Security** through safe serialization (toJSON)

## 📁 Available Models

### `User.js` - User Entity Model

Represents a user in the BusTrack SV system with full validation and security.

#### Features

- ✅ **Private fields** for data encapsulation
- ✅ **Automatic email normalization** (lowercase, trimmed)
- ✅ **Name validation** (trimmed, 2-100 characters)
- ✅ **Role validation** (admin, supervisor only)
- ✅ **Password hash protection** (never exposed via toJSON)
- ✅ **Timestamp management** (createdAt, updatedAt)

#### Usage Example

```javascript
const User = require('./models/User');

// Create a new user
const user = new User({
  id: '1',
  email: 'ADMIN@BusTrack.COM', // Will be normalized to lowercase
  name: '  John Doe  ',         // Will be trimmed
  role: 'admin',
  passwordHash: '$2b$10$...'
});

// Access via getters
console.log(user.email); // 'admin@bustrack.com'
console.log(user.name);  // 'John Doe'
console.log(user.role);  // 'admin'

// Safe serialization (NEVER exposes passwordHash)
const json = user.toJSON();
console.log(json);
// {
//   id: '1',
//   email: 'admin@bustrack.com',
//   name: 'John Doe',
//   role: 'admin',
//   createdAt: '2024-01-01T00:00:00.000Z',
//   updatedAt: '2024-01-01T00:00:00.000Z'
// }

// For database operations (includes passwordHash)
const dbObject = user.toDatabase();

// Static methods
console.log(User.collection());        // 'users'
console.log(User.getAllowedRoles());   // ['admin', 'supervisor']

// Instance methods
user.isAdmin();      // true
user.isSupervisor(); // false
user.touch();        // Updates updatedAt to now
```

#### Fields

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `id` | string | Required, non-empty | User identifier |
| `email` | string | Required, valid format | Auto-converted to lowercase |
| `name` | string | Required, 2-100 chars | Auto-trimmed |
| `role` | string | Must be 'admin' or 'supervisor' | Validated against enum |
| `passwordHash` | string | Required, min 10 chars | Never exposed in toJSON() |
| `createdAt` | Date | Auto-set on creation | ISO 8601 string in JSON |
| `updatedAt` | Date | Auto-updated | ISO 8601 string in JSON |

#### Methods

**Getters:**
- `id` - Get user ID
- `email` - Get email (lowercase)
- `name` - Get name (trimmed)
- `role` - Get role
- `passwordHash` - Get password hash (use sparingly)
- `createdAt` - Get creation timestamp
- `updatedAt` - Get last update timestamp

**Setters** (with validation):
- `id = value` - Set ID (validates non-empty)
- `email = value` - Set email (validates format, converts to lowercase)
- `name = value` - Set name (trims, validates length)
- `role = value` - Set role (validates against allowed roles)
- `passwordHash = value` - Set password hash (validates length)
- `createdAt = value` - Set creation timestamp
- `updatedAt = value` - Set update timestamp

**Instance Methods:**
- `toJSON()` - Convert to safe JSON (excludes passwordHash)
- `toDatabase()` - Convert to database object (includes passwordHash)
- `isAdmin()` - Check if user has admin role
- `isSupervisor()` - Check if user has supervisor role
- `touch()` - Update updatedAt to current time

**Static Methods:**
- `User.collection()` - Returns 'users' (Firestore collection name)
- `User.getAllowedRoles()` - Returns ['admin', 'supervisor']
- `User.fromDatabase(doc)` - Create User from database document

#### Validation Rules

All validation happens automatically in setters and constructor:

```javascript
// ✓ Valid
const user = new User({
  id: '1',
  email: 'valid@example.com',
  name: 'John Doe',
  role: 'admin',
  passwordHash: '$2b$10$validHashHere123456'
});

// ✗ Invalid - throws errors
new User({ email: 'invalid' });           // Invalid email format
new User({ name: 'X' });                  // Name too short
new User({ role: 'superadmin' });         // Invalid role
new User({ passwordHash: 'short' });      // Password hash too short
```

#### Security Features

**Password Hash Protection:**
```javascript
const user = new User({
  id: '1',
  email: 'secure@test.com',
  name: 'Secure User',
  role: 'admin',
  passwordHash: '$2b$10$secretHash'
});

// ✓ Safe - passwordHash NOT included
console.log(user.toJSON());
// { id: '1', email: '...', name: '...', role: 'admin', ... }

// ✓ Safe - JSON.stringify uses toJSON()
console.log(JSON.stringify(user));
// Same as toJSON()

// ⚠️ Use only for database saves
console.log(user.toDatabase());
// { id: '1', ..., passwordHash: '$2b$10$secretHash' }
```

## 🔒 Best Practices

### 1. Always Use toJSON() for API Responses
```javascript
// ✓ Good - Safe for API response
res.json({ user: user.toJSON() });

// ✗ Bad - Would expose passwordHash if you access it
res.json({ user: user.toDatabase() });
```

### 2. Validate Before Creating
```javascript
// Let the model handle validation
try {
  const user = new User(userData);
  // User is valid
} catch (error) {
  // Handle validation error
  console.error(error.message);
}
```

### 3. Use Static Methods
```javascript
// Get collection name
const collectionRef = db.collection(User.collection());

// Load from database
const doc = await collectionRef.doc(userId).get();
const user = User.fromDatabase(doc.data());
```

### 4. Update Timestamps
```javascript
// Before saving to database
user.touch();
await db.collection(User.collection()).doc(user.id).update(user.toDatabase());
```

## 🧪 Testing

Run User model tests:
```bash
node tests/models/User.test.js
```

Test coverage includes:
- ✅ Valid user creation
- ✅ Email normalization (lowercase)
- ✅ Name trimming
- ✅ Validation errors for all fields
- ✅ toJSON() security (never exposes passwordHash)
- ✅ Setter validation
- ✅ Static methods
- ✅ Instance methods
- ✅ toDatabase() includes passwordHash

### `Bus.js` - Bus Entity Model

Represents a bus in the BusTrack SV system with tracking and status management.

#### Features

- ✅ **Private fields** for data encapsulation
- ✅ **Automatic license plate normalization** (uppercase, trimmed)
- ✅ **Unit name validation** (trimmed, 1-50 characters)
- ✅ **Status validation** (parked, moving, maintenance only)
- ✅ **Optional GPS position** with coordinate range validation
- ✅ **Tracking times** (movingTime, parkedTime)
- ✅ **Favorite marking** support

#### Usage Example

```javascript
const Bus = require('./models/Bus');

// Create a new bus
const bus = new Bus({
  id: '1',
  licensePlate: 'abc-123',        // Will be normalized to 'ABC-123'
  unitName: 'Bus 001',
  status: 'moving',
  route: 'Route 1',
  driver: 'Driver 123',
  movingTime: 3600,
  parkedTime: 1800,
  isFavorite: true,
  position: { lat: 13.6929, lng: -89.2182 } // Optional
});

// Access via getters
console.log(bus.licensePlate); // 'ABC-123'
console.log(bus.status);        // 'moving'
console.log(bus.position);      // { lat: 13.6929, lng: -89.2182 }

// Status checks
bus.isMoving();      // true
bus.isParked();      // false
bus.hasPosition();   // true

// Position management
bus.updatePosition(14.0, -88.0);
bus.clearPosition();

// Safe serialization
const json = bus.toJSON();
console.log(json);
// {
//   id: '1',
//   licensePlate: 'ABC-123',
//   unitName: 'Bus 001',
//   status: 'moving',
//   route: 'Route 1',
//   driver: 'Driver 123',
//   movingTime: 3600,
//   parkedTime: 1800,
//   isFavorite: true,
//   position: { lat: 13.6929, lng: -89.2182 }
// }
```

#### Fields

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `id` | string | Required, non-empty | Bus identifier |
| `licensePlate` | string | Required, ≥3 chars, ≤20 chars | Auto-converted to uppercase |
| `unitName` | string | Required, 1-50 chars | Auto-trimmed |
| `status` | string | Must be 'parked', 'moving', or 'maintenance' | Validated against enum |
| `route` | string\|null | Optional | Route identifier |
| `driver` | string\|null | Optional | Driver identifier |
| `movingTime` | number | Default: 0, must be ≥0 | Time spent moving in seconds |
| `parkedTime` | number | Default: 0, must be ≥0 | Time spent parked in seconds |
| `isFavorite` | boolean | Default: false | Favorite marker |
| `position` | Object\|null | Optional, validates coordinates | GPS position with {lat, lng} |

#### Position Field (Optional)

The `position` field is **optional** but when provided, it validates:

```javascript
// ✓ Valid positions
{ lat: 13.6929, lng: -89.2182 }  // San Salvador
{ lat: 90, lng: 0 }               // North Pole
{ lat: -90, lng: 180 }            // South Pole, Date Line
{ lat: 0, lng: 0 }                // Null Island

// ✗ Invalid positions (throw clear errors)
{ lat: 91, lng: 0 }               // Latitude out of range
{ lat: 0, lng: 181 }              // Longitude out of range
{ lng: -89.2182 }                 // Missing latitude
{ lat: 13.6929 }                  // Missing longitude
{ lat: 'north', lng: 'west' }     // Non-numeric coordinates
```

**Coordinate Ranges:**
- Latitude: -90 to 90 (degrees)
- Longitude: -180 to 180 (degrees)

#### Methods

**Getters:**
- `id` - Get bus ID
- `licensePlate` - Get license plate (uppercase)
- `unitName` - Get unit name (trimmed)
- `status` - Get status
- `route` - Get route identifier
- `driver` - Get driver identifier
- `movingTime` - Get moving time in seconds
- `parkedTime` - Get parked time in seconds
- `isFavorite` - Get favorite status
- `position` - Get GPS position {lat, lng} or null

**Setters** (with validation):
- `id = value` - Set ID (validates non-empty)
- `licensePlate = value` - Set license plate (≥3 chars, converts to uppercase)
- `unitName = value` - Set unit name (trims, validates 1-50 chars)
- `status = value` - Set status (validates against allowed statuses)
- `route = value` - Set route (string or null)
- `driver = value` - Set driver (string or null)
- `movingTime = value` - Set moving time (validates ≥0)
- `parkedTime = value` - Set parked time (validates ≥0)
- `isFavorite = value` - Set favorite status (converts to boolean)
- `position = value` - Set position (validates coordinates or null)

**Instance Methods:**
- `isMoving()` - Check if status is 'moving'
- `isParked()` - Check if status is 'parked'
- `isInMaintenance()` - Check if status is 'maintenance'
- `hasPosition()` - Check if position is set (not null)
- `updatePosition(lat, lng)` - Update GPS position with validation
- `clearPosition()` - Remove GPS position (set to null)
- `toggleFavorite()` - Toggle favorite status
- `toJSON()` - Convert to JSON (all public fields)
- `toDatabase()` - Convert to database object (same as toJSON)

**Static Methods:**
- `Bus.collection()` - Returns 'buses' (Firestore collection name)
- `Bus.getAllowedStatuses()` - Returns ['parked', 'moving', 'maintenance']
- `Bus.fromDatabase(doc)` - Create Bus from database document

#### Validation Rules

All validation happens automatically in setters and constructor:

```javascript
// ✓ Valid
const bus = new Bus({
  id: '1',
  licensePlate: 'ABC-123',
  unitName: 'Bus 001',
  status: 'moving',
  position: { lat: 13.6929, lng: -89.2182 }
});

// ✗ Invalid - throws clear errors
new Bus({ licensePlate: 'AB' });                  // Too short (< 3 chars)
new Bus({ status: 'flying' });                    // Invalid status
new Bus({ position: { lat: 91, lng: 0 } });       // Latitude out of range
new Bus({ position: { lat: 0, lng: 181 } });      // Longitude out of range
new Bus({ position: { lat: 13.6929 } });          // Missing longitude
new Bus({ movingTime: -100 });                    // Negative time
```

#### Error Messages

The Bus model provides clear, specific error messages:

| Validation Error | Error Message |
|-----------------|---------------|
| Invalid status | "Invalid status: Invalid status. Allowed values: parked, moving, maintenance" |
| Latitude too high | "Invalid position coordinates: Latitude must be between -90 and 90" |
| Latitude too low | "Invalid position coordinates: Latitude must be between -90 and 90" |
| Longitude too high | "Invalid position coordinates: Longitude must be between -180 and 180" |
| Longitude too low | "Invalid position coordinates: Longitude must be between -180 and 180" |
| Missing coordinate | "Position must include both lat and lng properties" |
| Non-numeric coordinates | "Invalid position coordinates: Latitude and longitude must be numbers" |
| License plate too short | "License plate must be at least 3 characters long" |

#### Testing

Run Bus model tests:
```bash
node tests/models/Bus.test.js
```

Test coverage includes:
- ✅ Valid bus creation (5 tests)
- ✅ Status validation (5 tests)
- ✅ Position validation - optional and range checks (14 tests)
- ✅ License plate validation (3 tests)
- ✅ Instance methods (8 tests)
- ✅ toJSON() serialization (1 test)
- ✅ Static methods (3 tests)

**Total: 39 tests, all passing**

## 🎯 Future Models

Planned entity models:
- `Route.js` - Bus route with stops
- `Location.js` - GPS tracking data
- `Stop.js` - Bus stop entity
- `Schedule.js` - Bus schedule information
