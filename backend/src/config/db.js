/**
 * Firebase Admin SDK Configuration
 *
 * Initializes Firebase Admin in one of two ways:
 * 1. FIREBASE_SERVICE_ACCOUNT_BASE64 - Base64 encoded service account JSON
 * 2. GOOGLE_APPLICATION_CREDENTIALS - Path to service account JSON file
 *
 * Fails fast with clear error if credentials are not configured.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const config = require('./env');

// Set Firebase Emulator host in development mode ONLY if no credentials are provided
// This must happen before any Firebase Admin SDK calls
const {
  FIREBASE_SERVICE_ACCOUNT_BASE64,
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = config.firebase;

// Only use emulator if we don't have credentials
const hasCredentials = FIREBASE_SERVICE_ACCOUNT_BASE64 || GOOGLE_APPLICATION_CREDENTIALS;

if (config.env.IS_DEVELOPMENT && !process.env.FIRESTORE_EMULATOR_HOST && !hasCredentials) {
  // Default to 127.0.0.1:8080 to match Firebase Emulator default output
  // This avoids IPv6/IPv4 resolution issues on Windows
  // Priority: FIREBASE_EMULATOR_HOST env var > default 127.0.0.1:8080
  const emulatorHost = process.env.FIREBASE_EMULATOR_HOST || '127.0.0.1:8080';
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  console.log(`✓ Configured Firestore emulator at ${emulatorHost}`);
  console.log(`  (Set FIRESTORE_EMULATOR_HOST env var to override)`);
}

/**
 * Initialize Firebase Admin SDK
 * @returns {Object} Initialized Firebase Admin instance
 */
function initializeFirebase() {
  const {
    FIREBASE_SERVICE_ACCOUNT_BASE64,
    GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY
  } = config.firebase;

  let serviceAccount = null;

  // Method 1: Base64-encoded service account (preferred for production/deployment)
  if (FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decodedJson = Buffer.from(FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedJson);
      console.log('✓ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_BASE64');
    } catch (error) {
      console.error('✗ Failed to decode FIREBASE_SERVICE_ACCOUNT_BASE64:', error.message);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_BASE64: Unable to decode or parse JSON');
    }
  } else if (GOOGLE_APPLICATION_CREDENTIALS) {
    // Method 2: Path to service account JSON file (useful for local development)
    try {
      // Resolve path relative to backend directory (2 levels up from src/config)
      const backendRoot = path.resolve(__dirname, '../..');
      const credentialsPath = path.resolve(backendRoot, GOOGLE_APPLICATION_CREDENTIALS);
      
      // Use fs.readFileSync instead of require() to properly handle \n in private_key
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`File not found: ${credentialsPath}`);
      }
      
      const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
      serviceAccount = JSON.parse(credentialsContent);
      
      // Ensure private_key has proper line breaks (replace \\n with \n if needed)
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      console.log(`✓ Firebase credentials loaded from ${GOOGLE_APPLICATION_CREDENTIALS}`);
    } catch (error) {
      console.error(`✗ Failed to load Firebase credentials from ${GOOGLE_APPLICATION_CREDENTIALS}:`, error.message);
      throw new Error(`Unable to load service account from path: ${GOOGLE_APPLICATION_CREDENTIALS} - ${error.message}`);
    }
  } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    // Method 3: Plain env vars (common in CI or when mounting secrets)
    serviceAccount = {
      project_id: FIREBASE_PROJECT_ID,
      client_email: FIREBASE_CLIENT_EMAIL,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
    console.log('✓ Firebase credentials loaded from FIREBASE_* env vars');
  } else {
    // No credentials provided - check if we're using emulator
    if (config.env.IS_DEVELOPMENT && process.env.FIRESTORE_EMULATOR_HOST) {
      // Using emulator - initialize with minimal config (no credentials needed)
      console.log('✓ Using Firestore Emulator (no credentials required)');
      try {
        if (admin.apps.length === 0) {
          admin.initializeApp({
            projectId: FIREBASE_PROJECT_ID || 'local-emulator',
            credential: admin.credential.applicationDefault()
          });
          console.log('✓ Firebase Admin SDK initialized for emulator');
        }
        return admin;
      } catch (error) {
        // If applicationDefault() fails, use a dummy credential
        console.warn('⚠️  Could not use applicationDefault credentials, using dummy credential for emulator');
        if (admin.apps.length === 0) {
          admin.initializeApp({
            projectId: FIREBASE_PROJECT_ID || 'local-emulator',
            credential: admin.credential.cert({
              projectId: FIREBASE_PROJECT_ID || 'local-emulator',
              privateKey: '-----BEGIN PRIVATE KEY-----\nMIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEA0dummy\n-----END PRIVATE KEY-----\n',
              clientEmail: `${FIREBASE_PROJECT_ID || 'local-emulator'}@dummy.iam.gserviceaccount.com`
            })
          });
          console.log('✓ Firebase Admin SDK initialized with dummy credential for emulator');
        }
        return admin;
      }
    }

    // No credentials and no emulator - return stub
    const warnMessage = `
Firebase Admin credentials are not configured. The server will run in "no-Firebase" mode.
Some features that depend on Firestore will be disabled or will throw at runtime.

Provide one of the following to enable Firebase:
  - FIREBASE_SERVICE_ACCOUNT_BASE64 (base64-encoded JSON)
  - GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
  - Or use Firebase Emulator in development (FIRESTORE_EMULATOR_HOST)

See backend/.env.example for examples.
`.trim();

    console.warn(warnMessage);

    // Return a minimal stub admin object with a firestore() method that provides
    // clear runtime errors when used. This keeps the rest of the app importable
    // without forcing a hard process.exit during development.
    const stubAdmin = {
      firestore: () => ({
        collection: () => ({
          doc: () => ({
            set: async () => { throw new Error('Firestore is not available in no-Firebase (stub) mode'); },
            get: async () => ({ exists: false }),
            update: async () => { throw new Error('Firestore is not available in no-Firebase (stub) mode'); },
            delete: async () => { throw new Error('Firestore is not available in no-Firebase (stub) mode'); }
          })
        })
      }),
      credential: { cert: () => null }
    };

    return stubAdmin;
  }

  // Initialize Firebase Admin with the service account
  const initConfig = {
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id  // Agregar explícitamente el projectId
  };

  // Add database URL if provided (solo para Realtime Database, no para Firestore)
  if (FIREBASE_DATABASE_URL) {
    initConfig.databaseURL = FIREBASE_DATABASE_URL;
  }

  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp(initConfig);
      console.log('✓ Firebase Admin SDK initialized successfully');
    } else {
      console.log('✓ Firebase Admin SDK already initialized');
      return admin.app();
    }
  } catch (error) {
    console.error('✗ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }

  return admin;
}

// Initialize Firebase Admin
let firebaseAdmin;
let db;

try {
  firebaseAdmin = initializeFirebase();
  db = firebaseAdmin.firestore();
} catch (error) {
  // If initialization fails, use stub mode
  console.warn('⚠️  Firebase initialization failed, using stub mode');
  const stubAdmin = {
    firestore: () => ({
      collection: () => ({
        doc: () => ({
          set: async () => { throw new Error('Firestore is not available in stub mode'); },
          get: async () => ({ exists: false }),
          update: async () => { throw new Error('Firestore is not available in stub mode'); },
          delete: async () => { throw new Error('Firestore is not available in stub mode'); }
        }),
        add: async () => { throw new Error('Firestore is not available in stub mode'); },
        where: () => ({
          limit: () => ({
            get: async () => ({ empty: true, docs: [] })
          }),
          get: async () => ({ empty: true, docs: [] })
        }),
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        }),
        get: async () => ({ empty: true, docs: [] })
      })
    }),
    credential: { cert: () => null }
  };
  firebaseAdmin = stubAdmin;
  db = stubAdmin.firestore();
}

module.exports = {
  admin: firebaseAdmin,
  db
};
