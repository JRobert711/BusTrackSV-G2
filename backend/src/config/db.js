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
const config = require('./env');

/**
 * Initialize Firebase Admin SDK
 * @returns {Object} Initialized Firebase Admin instance
 */
function initializeFirebase() {
  const {
    FIREBASE_SERVICE_ACCOUNT_BASE64,
    GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_DATABASE_URL
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
      // eslint-disable-next-line global-require
      serviceAccount = require(credentialsPath);
      console.log(`✓ Firebase credentials loaded from ${GOOGLE_APPLICATION_CREDENTIALS}`);
    } catch (error) {
      console.error(`✗ Failed to load Firebase credentials from ${GOOGLE_APPLICATION_CREDENTIALS}:`, error.message);
      throw new Error(`Unable to load service account from path: ${GOOGLE_APPLICATION_CREDENTIALS}`);
    }
  } else {
    // No credentials provided - FAIL FAST
    const errorMessage = `
╔════════════════════════════════════════════════════════════════════╗
║                    CONFIGURATION ERROR                             ║
╠════════════════════════════════════════════════════════════════════╣
║  Firebase Admin credentials are not configured.                    ║
║                                                                    ║
║  Please provide ONE of the following:                              ║
║                                                                    ║
║  Option 1 (Recommended for production):                            ║
║    FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-json>          ║
║                                                                    ║
║  Option 2 (Recommended for local development):                     ║
║    GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccount.json   ║
║                                                                    ║
║  See .env.example for more details.                                ║
╚════════════════════════════════════════════════════════════════════╝
    `.trim();

    console.error(errorMessage);
    throw new Error('Firebase Admin credentials are not configured');
  }

  // Initialize Firebase Admin with the service account
  const initConfig = {
    credential: admin.credential.cert(serviceAccount)
  };

  // Add database URL if provided
  if (FIREBASE_DATABASE_URL) {
    initConfig.databaseURL = FIREBASE_DATABASE_URL;
  }

  try {
    admin.initializeApp(initConfig);
    console.log('✓ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }

  return admin;
}

// Initialize Firebase Admin
const firebaseAdmin = initializeFirebase();

// Export Firestore database instance and admin
const db = firebaseAdmin.firestore();

module.exports = {
  admin: firebaseAdmin,
  db
};
