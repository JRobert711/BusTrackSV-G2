# Services

Business logic layer (use-cases) and data access layer (repositories).

## 📁 Repository Pattern

**Architecture:**
```
Controllers → Services → Repositories → Firestore
```

### Available Repositories

**`userRepository.js`** - User data access
- `findByEmail(email)` - Find by email
- `findById(id)` - Find by ID  
- `create(user)` - Create with server timestamps
- `update(user)` - Update with server timestamps
- Maps User domain model ↔ Firestore

**`busRepository.js`** - Bus data access
- `list({page, pageSize, filters})` - Paginated list
- `findById(id)` - Find by ID
- `findByLicensePlate(plate)` - Find by license plate
- `create(bus)` - Create with server timestamps
- `update(bus)` - Update with server timestamps
- `remove(id)` - Delete bus
- Maps Bus domain model ↔ Firestore

### Usage Example

```javascript
const { userRepository } = require('./userRepository');
const User = require('../models/User');

// Create user
const user = new User({
  email: 'admin@bustrack.com',
  name: 'Admin',
  role: 'admin',
  passwordHash: await bcrypt.hash('password', 10)
});

const created = await userRepository.create(user);
// createdAt & updatedAt added by Firestore server timestamps

// Find user
const found = await userRepository.findByEmail('admin@bustrack.com');
if (!found) {
  throw new Error('Not found');
}
```

### Error Handling

Repositories surface Firestore errors as 500 through controllers:

```javascript
// Repository throws
throw new Error(`Database error: ${error.message}`);

// Global error handler catches
res.status(500).json({ 
  error: "Database error: ...",
  type: "Error"
});
```

### Pagination

Currently uses offset-based pagination. Cursor pagination planned:

```javascript
const result = await busRepository.list({
  page: 1,
  pageSize: 10,
  filters: { status: 'moving' }
});

// Returns: { buses, total, page, pageSize, totalPages, hasMore }
// TODO: Cursor-based with startAfter for better performance
```

## 📝 Services (Business Logic)

**`auth.service.js`** - Authentication logic (mock)
**`bus.service.js`** - Bus business logic (mock)

Services orchestrate repositories and implement business rules.
