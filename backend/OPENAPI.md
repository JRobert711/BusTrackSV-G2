# OpenAPI Specification

This directory contains the OpenAPI 3.1 specification for the BusTrack SV API.

## File

**`openapi.yaml`** - Complete API specification in OpenAPI 3.1 format

## Contents

The specification documents:

### Endpoints
- **Authentication** (`/auth/*`)
  - POST `/auth/register` - Register new user
  - POST `/auth/login` - Authenticate user
  - POST `/auth/refresh` - Refresh access token
  - GET `/auth/me` - Get current user profile

- **Buses** (`/buses/*`)
  - GET `/buses` - List buses (paginated, with filters)
  - GET `/buses/{id}` - Get single bus
  - POST `/buses` - Create bus (admin only)
  - PATCH `/buses/{id}` - Update bus (admin only)
  - PATCH `/buses/{id}/favorite` - Toggle favorite (all authenticated)
  - DELETE `/buses/{id}` - Delete bus (admin only)
  - PATCH `/buses/{id}/position` - Update GPS position (admin only)

- **GPS** (`/gps/*`) - **RESERVED FOR FUTURE IMPLEMENTATION**
  - POST `/gps/ingest` - Ingest GPS data from devices (returns 501)

- **Health** (`/health`, `/ready`)
  - GET `/health` - Service health check
  - GET `/ready` - Service readiness check

### Components

**Schemas:**
- `UserPublic` - User without password hash
- `Bus` - Complete bus entity
- `BusInput` - Bus creation payload
- `BusUpdate` - Bus update payload (all fields optional)
- `Position` - GPS coordinates (lat, lng)
- `GPSDataInput` - GPS data payload from tracking device (reserved)
- `Pagination` - Pagination metadata
- `AuthResponse` - Login/register response
- `ErrorResponse` - Standard error format
- `ValidationErrorResponse` - Validation error format (422)

**Security:**
- `bearerAuth` - JWT Bearer token authentication

**Parameters:**
- `page` - Page number (1-indexed, default: 1)
- `pageSize` - Items per page (default: 10, max: 100)
- `route` - Filter by route
- `status` - Filter by status (parked, moving, maintenance)
- `sort` - Sort field (createdAt, licensePlate, unitName, status)
- `order` - Sort order (asc, desc)

## Validation

### Using Swagger Editor

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Click "File" → "Import file"
3. Select `openapi.yaml`
4. Check for validation errors in the right panel

### Using Swagger CLI

```bash
# Install Swagger CLI
npm install -g @apidevtools/swagger-cli

# Validate the spec
swagger-cli validate openapi.yaml
```

### Using Redocly CLI

```bash
# Install Redocly CLI
npm install -g @redocly/cli

# Lint and validate the spec
redocly lint openapi.yaml

# Bundle the spec (resolves $refs)
redocly bundle openapi.yaml -o openapi.bundle.yaml
```

## Viewing Documentation

### Swagger UI

```bash
# Install swagger-ui-express
npm install swagger-ui-express yamljs

# Add to your Express app (already included in app.js if configured)
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Then visit: http://localhost:5000/api-docs

### Redoc

```bash
# Install redoc-cli
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli bundle openapi.yaml -o api-docs.html

# Serve the documentation
redoc-cli serve openapi.yaml
```

Then visit: http://localhost:8080

## Runtime Response Verification

The OpenAPI spec matches our actual runtime responses:

### Status Codes Match

| Scenario | Spec | Runtime | ✓ |
|----------|------|---------|---|
| Successful creation | 201 | 201 | ✅ |
| Successful retrieval | 200 | 200 | ✅ |
| Successful deletion | 204 | 204 | ✅ |
| Validation error | 422 | 422 | ✅ |
| Unauthorized | 401 | 401 | ✅ |
| Forbidden | 403 | 403 | ✅ |
| Not found | 404 | 404 | ✅ |
| Conflict | 409 | 409 | ✅ |
| Rate limit | 429 | 429 | ✅ |

### Response Shapes Match

**Authentication Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "admin | supervisor",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  },
  "token": "JWT string",
  "refreshToken": "JWT string"
}
```
✅ Matches `AuthResponse` schema

**Bus Response:**
```json
{
  "bus": {
    "id": "string",
    "licensePlate": "string",
    "unitName": "string",
    "status": "parked | moving | maintenance",
    "route": "string | null",
    "driver": "string | null",
    "movingTime": number,
    "parkedTime": number,
    "isFavorite": boolean,
    "position": { "lat": number, "lng": number } | null
  }
}
```
✅ Matches `Bus` schema

**Pagination Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": number,
    "pageSize": number,
    "total": number,
    "totalPages": number,
    "hasMore": boolean
  }
}
```
✅ Matches `Pagination` schema

**Error Envelope:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "error message"
    }
  }
}
```
✅ Matches `ValidationErrorResponse` schema

**Standard Error:**
```json
{
  "error": "Error message",
  "type": "ERROR_TYPE"
}
```
✅ Matches `ErrorResponse` schema

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bustrack.com",
    "name": "Admin User",
    "password": "MyP@ssw0rd123",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bustrack.com",
    "password": "MyP@ssw0rd123"
  }'
```

### List Buses (with filters and pagination)
```bash
curl -X GET "http://localhost:5000/api/v1/buses?page=1&pageSize=10&status=moving" \
  -H "Authorization: Bearer <token>"
```

### Create Bus (admin only)
```bash
curl -X POST http://localhost:5000/api/v1/buses \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "ABC-123",
    "unitName": "Bus 001",
    "status": "parked",
    "position": {
      "lat": 13.6929,
      "lng": -89.2182
    }
  }'
```

### Toggle Favorite
```bash
curl -X PATCH http://localhost:5000/api/v1/buses/bus001/favorite \
  -H "Authorization: Bearer <token>"
```

## Code Generation

The OpenAPI spec can be used to generate client SDKs and server stubs:

### Generate TypeScript Client
```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o ./generated/typescript-client
```

### Generate Python Client
```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./generated/python-client
```

## Maintenance

When adding new endpoints or modifying existing ones:

1. **Update `openapi.yaml`** with the new/modified endpoint
2. **Add request/response examples** that match runtime behavior
3. **Validate the spec** using Swagger Editor or CLI
4. **Test the endpoint** to ensure responses match the spec
5. **Update this documentation** if necessary

## Best Practices

1. **Keep spec in sync with code** - Update spec whenever API changes
2. **Use examples liberally** - They help developers understand the API
3. **Document all error cases** - Include all possible status codes
4. **Be specific with schemas** - Use enums, min/max, patterns where appropriate
5. **Version your API** - Include version in the URL (/api/v1)
6. **Test against spec** - Use tools to validate runtime responses match spec

## Resources

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger Editor](https://editor.swagger.io/)
- [Redoc](https://redocly.com/redoc/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)
