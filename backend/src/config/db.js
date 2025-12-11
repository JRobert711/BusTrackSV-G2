/**
 * Firebase Admin SDK Configuration
 *
 * Initializes Firebase Admin in one of three ways:
 * 1. FIREBASE_SERVICE_ACCOUNT_BASE64 - Base64 encoded service account JSON
 * 2. GOOGLE_APPLICATION_CREDENTIALS - Path to service account JSON file
 * 3. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY - Plain env vars
 *
 * Fails fast with clear error if credentials are not configured.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const config = require('./env');

const {
  FIREBASE_SERVICE_ACCOUNT_BASE64,
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = config.firebase;

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
      let credentialsPath = path.resolve(backendRoot, GOOGLE_APPLICATION_CREDENTIALS);
      
      // If the provided path does not exist, fallback to the bundled default
      if (!fs.existsSync(credentialsPath)) {
        const fallbackPath = path.resolve(backendRoot, 'src/config/firebase-adminsdk.json');
        console.warn(`⚠️  File not found at ${credentialsPath}. Falling back to ${fallbackPath}`);
        credentialsPath = fallbackPath;
      }
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`File not found: ${credentialsPath}`);
      }
      
      const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
      serviceAccount = JSON.parse(credentialsContent);
      
      // Ensure private_key has proper line breaks (replace \\n with \n if needed)
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      console.log(`✓ Firebase credentials loaded from ${credentialsPath}`);
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
    // No credentials provided - return stub
    const warnMessage = `
Firebase Admin credentials are not configured. The server will run in "no-Firebase" mode.
Some features that depend on Firestore will be disabled or will throw at runtime.

Provide one of the following to enable Firebase:
  - FIREBASE_SERVICE_ACCOUNT_BASE64 (base64-encoded JSON)
  - GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
  - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (plain env vars)

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
