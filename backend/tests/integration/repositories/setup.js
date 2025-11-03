/**
 * Firestore Emulator Setup for Integration Tests
 *
 * Configures Firestore Emulator connection for testing.
 */

const admin = require('firebase-admin');

// Firestore Emulator configuration
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';

/**
 * Initialize Firebase Admin for testing with emulator
 */
function initializeTestFirebase() {
  // Check if already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: 'bustrack-test',
      credential: admin.credential.applicationDefault()
    });
  }

  const db = admin.firestore();
  
  // Connect to emulator
  db.settings({
    host: EMULATOR_HOST,
    ssl: false
  });

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
