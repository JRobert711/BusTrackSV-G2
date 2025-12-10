/**
 * Firebase Setup for Integration Tests
 *
 * Configures Firebase connection for testing using real Firebase credentials.
 * IMPORTANT: Tests will run against the actual Firebase project configured
 * in environment variables. Make sure to use a test/development project.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Initialize Firebase Admin for testing with real Firebase
 */
function initializeTestFirebase() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return {
      admin,
      db: admin.firestore()
    };
  }

  // Load credentials from environment (same as production)
  const {
    FIREBASE_SERVICE_ACCOUNT_BASE64,
    GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY
  } = process.env;

  let serviceAccount = null;

  // Method 1: Base64-encoded service account
  if (FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decodedJson = Buffer.from(FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedJson);
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_BASE64: Unable to decode or parse JSON');
    }
  } else if (GOOGLE_APPLICATION_CREDENTIALS) {
    // Method 2: Path to service account JSON file
    const credentialsPath = path.resolve(process.cwd(), GOOGLE_APPLICATION_CREDENTIALS);
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Service account file not found: ${credentialsPath}`);
    }
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    serviceAccount = JSON.parse(credentialsContent);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    // Method 3: Plain env vars
    serviceAccount = {
      project_id: FIREBASE_PROJECT_ID,
      client_email: FIREBASE_CLIENT_EMAIL,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  } else {
    throw new Error(
      'Firebase credentials not configured for tests. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_BASE64, GOOGLE_APPLICATION_CREDENTIALS, ' +
      'or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY'
    );
  }

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });

  const db = admin.firestore();

  return { admin, db };
}

/**
 * Clean all collections in the database
 */
async function cleanDatabase(db) {
  const collections = ['users', 'buses'];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

/**
 * Clear a specific collection
 */
async function clearCollection(db, collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

module.exports = {
  initializeTestFirebase,
  cleanDatabase,
  clearCollection
};
