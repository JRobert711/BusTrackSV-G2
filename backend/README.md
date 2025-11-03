# BusTrack SV - Backend API

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

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm test` | Run tests (placeholder, to be implemented) |

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

Testing setup to be implemented. Planned stack:
- Jest for unit tests
- Supertest for API integration tests

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

For detailed documentation, see [`OPENAPI.md`](./OPENAPI.md)

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
