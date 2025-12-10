// Firebase Configuration
// Replace these values with your Firebase project configuration
// You can find these in your Firebase Console > Project Settings > General > Your apps

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Helper to strip quotes/commas that may be added accidentally in .env
const clean = (value?: string | null) => {
  if (!value) return value;
  return value.trim().replace(/^['"]+|['",\s]+$/g, '');
};

// Your web app's Firebase configuration
// Get this from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  databaseURL: clean(import.meta.env.VITE_FIREBASE_DATABASE_URL),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: clean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID)
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
    console.error(
      `Firebase config faltante o incompleto: ${missingVars.join(', ')}. ` +
      'Revisa frontend/web/.env (usa prefijo VITE_ y reinicia el dev server).'
    );
    throw new Error(`Firebase config missing: ${missingVars.join(', ')}`);
  }

  // Log en desarrollo para depurar (valores enmascarados)
  if (import.meta.env.DEV) {
    const mask = (v?: string) => (v ? `${v.slice(0, 6)}***${v.slice(-4)}` : 'null');
    const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const looksWrapped = rawApiKey?.trim().startsWith('"') || rawApiKey?.trim().endsWith(',') || rawApiKey?.trim().endsWith('"');

    console.info('Firebase config cargado', {
      apiKey: mask(clean(rawApiKey)),
      projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
      authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      note: looksWrapped ? 'El .env parece tener comillas o comas extra; corrígelo si ves errores de API key' : undefined
    });
  }
}

// Initialize Firebase con captura de errores para no dejar la pantalla en blanco sin pista
let app;
try {
  // Reutilizar la app si ya fue creada (evita app/duplicate-app en HMR)
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error: any) {
  console.error('Error inicializando Firebase:', error?.message || error);
  throw error;
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;
