# Database Seed Script

⚠️ **DEVELOPMENT ONLY** - Do not run in production!

## Overview

The seed script (`seed.js`) populates your Firestore database with sample data for development and testing purposes.

## Prerequisites

Before running the seed script, ensure you have:

1. **Node.js** installed (>= 18.0.0)
2. **Dependencies** installed (`npm install`)
3. **Firebase credentials** configured in `.env`:
   ```bash
   # Option 1: Base64-encoded service account (production)
   FIREBASE_SERVICE_ACCOUNT_BASE64=<your-base64-encoded-json>
   
   # Option 2: Path to service account file (development)
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccount.json
   ```
4. **Firestore** enabled in your Firebase project

## Usage

```bash
npm run seed
```

Or directly:

```bash
node scripts/seed.js
```

## What It Seeds

### 1. Admin User

Creates a system administrator account:

- **Email**: `admin@bustrack.com`
- **Password**: `Admin123!@#`
- **Role**: `admin`
- **Name**: `System Administrator`

⚠️ **Security Note**: Change this password immediately after first login in any non-local environment!

### 2. Sample Buses

Creates 5 sample buses with varied characteristics:

| License Plate | Unit Name | Status | Route | Driver | Position |
|---------------|-----------|--------|-------|--------|----------|
| P-123456 | Ruta 29 - Bus 001 | moving | Ruta 29 | driver-001 | 13.6929, -89.2182 |
| P-234567 | Ruta 44 - Bus 002 | parked | Ruta 44 | driver-002 | 13.7094, -89.2036 |
| P-345678 | Ruta 52 - Bus 003 | maintenance | Ruta 52 | null | null |
| P-456789 | Ruta 101 - Bus 004 | moving | Ruta 101 | driver-003 | 13.6825, -89.2447 |
| P-567890 | Ruta 7C - Bus 005 | parked | Ruta 7C | driver-004 | 13.6743, -89.2326 |

## Idempotency

The seed script is **idempotent** - it can be run multiple times safely without creating duplicate data.

**How it works:**
- **Admin user**: Checks if `admin@bustrack.com` already exists before creating
- **Buses**: Checks if each license plate already exists before creating

**Example output on re-run:**
```
📝 Seeding admin user...
   ✓ Admin user already exists: admin@bustrack.com

🚌 Seeding sample buses...
   ⊘ Bus already exists: P-123456 (Ruta 29 - Bus 001)
   ⊘ Bus already exists: P-234567 (Ruta 44 - Bus 002)
   ...
```

## After Seeding

Once the seed completes successfully, you can:

### 1. Login to Get JWT Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bustrack.com",
    "password": "Admin123!@#"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@bustrack.com",
    "name": "System Administrator",
    "role": "admin",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Access Protected Endpoints

Use the `token` from the login response:

```bash
# List all buses
curl -X GET http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer <your-token>"

# Get specific bus
curl -X GET http://localhost:5000/api/v1/buses/<bus-id> \
  -H "Authorization: Bearer <your-token>"

# Create new bus (admin only)
curl -X POST http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "P-999999",
    "unitName": "Test Bus",
    "status": "parked"
  }'
```

## Production Safety

The seed script includes several safety mechanisms:

### 1. Environment Check

```javascript
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Seed script cannot be run in production!');
  process.exit(1);
}
```

The script will **refuse to run** if `NODE_ENV=production`.

### 2. Password Security

- Passwords are hashed using bcrypt with configurable salt rounds
- Default: 10 rounds (from `BCRYPT_SALT_ROUNDS` env var)

### 3. Data Validation

All data passes through the same validation as the API:
- User model validation (email format, password policy)
- Bus model validation (license plate, status enum, coordinates)

## Troubleshooting

### Firebase Credentials Not Configured

**Error:**
```
Error: Firebase Admin credentials are not configured
```

**Solution:**
Add Firebase credentials to your `.env` file. See `.env.example` for details.

### Admin Already Exists

This is **not an error** - the script is working correctly! It detected the existing admin user and skipped creation.

### Bus Creation Failed

**Possible causes:**
1. Invalid license plate format
2. Invalid coordinates (lat/lng out of range)
3. Invalid status enum value
4. Firestore permission issues

**Solution:**
Check the error message for specific details. Ensure your Firestore rules allow writes.

### Port Already in Use

If you're running the API server while seeding, that's fine! The seed script doesn't start a server - it only writes to the database.

## Customization

To customize the seed data:

1. **Edit admin credentials:**
   ```javascript
   const ADMIN_EMAIL = 'admin@bustrack.com';
   const ADMIN_PASSWORD = 'Admin123!@#';
   const ADMIN_NAME = 'System Administrator';
   ```

2. **Edit sample buses:**
   ```javascript
   const SAMPLE_BUSES = [
     {
       licensePlate: 'P-123456',
       unitName: 'Custom Bus Name',
       status: 'moving', // or 'parked', 'maintenance'
       // ...
     }
   ];
   ```

3. **Add more buses:**
   Just add more objects to the `SAMPLE_BUSES` array.

## Clean Database

To reset the database and re-seed:

1. **Delete all users from Firestore** (via Firebase Console)
2. **Delete all buses from Firestore** (via Firebase Console)
3. **Run seed again:** `npm run seed`

⚠️ **Warning**: This will permanently delete all data!

## Example Complete Flow

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with Firebase credentials

# 2. Install dependencies
npm install

# 3. Run seed
npm run seed

# 4. Start server (in another terminal)
npm run dev

# 5. Login to get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bustrack.com","password":"Admin123!@#"}'

# 6. Use token to access API
curl -X GET http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer <token-from-step-5>"
```

## Related Documentation

- [Main README](../README.md) - Project overview and setup
- [Environment Variables](../.env.example) - Required configuration
- [API Documentation](../OPENAPI.md) - API endpoints and usage
- [Repository Pattern](../src/services/README.md) - Data access layer
