// Firebase Configuration
// Replace these values with your Firebase project configuration
// You can find these in your Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// Get this from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required Firebase config values are present
// Only validate if at least one Firebase var is set (to avoid blocking if Firebase is not used)
const hasAnyFirebaseVar = Object.keys(firebaseConfig).some(
  key => firebaseConfig[key as keyof typeof firebaseConfig]
);

if (hasAnyFirebaseVar) {
  const requiredFirebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredFirebaseVars.filter(
    varName => !import.meta.env[varName] || import.meta.env[varName]?.startsWith('your-')
  );

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing or incomplete Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Firebase features may not work correctly. Please check your .env file.'
    );
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;
