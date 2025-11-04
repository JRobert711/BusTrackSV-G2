const admin = require('firebase-admin');
const { 
  FIREBASE_PROJECT_ID, 
  FIREBASE_PRIVATE_KEY, 
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_DATABASE_URL 
} = require('./env');

// Initialize Firebase Admin SDK
let app;

try {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length === 0) {
    // Initialize with service account credentials from environment variables
    if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️  Firebase Admin credentials not found in environment variables.');
      console.warn('   Firebase Admin SDK will not be initialized.');
      console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your .env file');
      app = null;
    } else {
      // Check if credentials are placeholder values
      if (FIREBASE_PROJECT_ID === 'your-project-id' || 
          FIREBASE_PRIVATE_KEY.includes('Your-Private-Key-Here') ||
          FIREBASE_CLIENT_EMAIL.includes('xxxxx')) {
        console.warn('⚠️  Firebase Admin credentials appear to be placeholder values.');
        console.warn('   Firebase Admin SDK will not be initialized.');
        console.warn('   Update your .env file with actual Firebase credentials from Firebase Console');
        app = null;
      } else {
        try {
          const serviceAccount = {
            projectId: FIREBASE_PROJECT_ID,
            privateKey: FIREBASE_PRIVATE_KEY,
            clientEmail: FIREBASE_CLIENT_EMAIL,
          };

          app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: FIREBASE_DATABASE_URL,
          });

          console.log('✅ Firebase Admin SDK initialized successfully');
        } catch (initError) {
          console.error('❌ Error initializing Firebase Admin SDK:', initError.message);
          console.error('   Make sure your Firebase credentials are correct in the .env file');
          console.warn('   Server will continue without Firebase (using mock data)');
          app = null;
        }
      }
    }
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('❌ Unexpected error initializing Firebase Admin SDK:', error.message);
  console.warn('   Server will continue without Firebase (using mock data)');
  app = null;
}

// Export Firebase services
const db = app ? admin.firestore() : null;
const auth = app ? admin.auth() : null;
const realtimeDb = app && FIREBASE_DATABASE_URL ? admin.database() : null;

module.exports = {
  app,
  db,
  auth,
  realtimeDb,
  admin,
};
