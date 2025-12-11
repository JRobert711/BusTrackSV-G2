#!/usr/bin/env node

/**
 * Initialize GTFS Collections in Firestore
 * 
 * Creates placeholder documents to initialize GTFS collections.
 * In Firestore, collections are created automatically when the first document is added.
 * 
 * Usage:
 *   node scripts/init-gtfs-collections.js
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Try to load Firebase Admin SDK with multiple methods
let db = null;

try {
  // Method 1: Try using db.js (supports GOOGLE_APPLICATION_CREDENTIALS and BASE64)
  const dbConfig = require('../src/config/db');
  if (dbConfig && dbConfig.db) {
    db = dbConfig.db;
    console.log('✓ Using Firebase Admin from db.js');
  }
} catch (error) {
  // Method 2: Try using firebase-admin.js
  try {
    const firebaseAdmin = require('../src/config/firebase-admin');
    if (firebaseAdmin && firebaseAdmin.db) {
      db = firebaseAdmin.db;
      console.log('✓ Using Firebase Admin from firebase-admin.js');
    }
  } catch (error2) {
    // Method 3: Try loading JSON file directly
    const jsonPath = path.join(__dirname, '../src/config/firebase-adminsdk.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const admin = require('firebase-admin');
        const serviceAccount = require(jsonPath);
        
        // Check if already initialized
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          console.log('✓ Firebase Admin initialized from firebase-adminsdk.json');
        }
        
        db = admin.firestore();
        console.log('✓ Using Firebase Admin from JSON file');
      } catch (error3) {
        console.error('✗ Failed to initialize from JSON file:', error3.message);
      }
    }
  }
}

// Collection names from GTFS models
const GTFS_COLLECTIONS = {
  AGENCIES: 'gtfs_agencies',
  STOPS: 'gtfs_stops',
  ROUTES: 'gtfs_routes',
  TRIPS: 'gtfs_trips',
  STOP_TIMES: 'gtfs_stop_times'
};

/**
 * Initialize a collection by creating a placeholder document
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<boolean>}
 */
async function initializeCollection(collectionName) {
  if (!db) {
    console.log(`⚠️  Firestore not configured. Skipping ${collectionName}.`);
    console.log(`   💡 Tip: Configure Firebase credentials in .env or use firebase-adminsdk.json`);
    return false;
  }

  try {
    const collectionRef = db.collection(collectionName);
    
    // Check if collection already has documents
    const snapshot = await collectionRef.limit(1).get();
    
    if (!snapshot.empty) {
      console.log(`   ✓ Collection '${collectionName}' already exists (has documents)`);
      return true;
    }

    // Create a placeholder document with a special ID
    // Note: We use a regular ID, not reserved keywords
    const placeholderId = '_initialization_marker';
    const placeholderRef = collectionRef.doc(placeholderId);
    
    // Check if placeholder already exists
    const placeholderDoc = await placeholderRef.get();
    
    if (placeholderDoc.exists) {
      console.log(`   ✓ Collection '${collectionName}' already initialized`);
      return true;
    }

    // Create placeholder document
    await placeholderRef.set({
      _initialized: true,
      _type: 'collection_placeholder',
      _createdAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
      _message: 'This document initializes the collection. Can be safely deleted.'
    }, { merge: false });

    console.log(`   ✓ Initialized collection '${collectionName}'`);
    return true;
  } catch (error) {
    console.error(`   ✗ Error initializing collection '${collectionName}':`, error.message);
    return false;
  }
}

/**
 * Remove placeholder documents (optional cleanup)
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<boolean>}
 */
async function removePlaceholder(collectionName) {
  if (!db) {
    return false;
  }

  try {
    const placeholderRef = db.collection(collectionName).doc('_initialization_marker');
    const placeholderDoc = await placeholderRef.get();
    
    if (placeholderDoc.exists) {
      await placeholderRef.delete();
      console.log(`   ✓ Removed placeholder from '${collectionName}'`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ✗ Error removing placeholder from '${collectionName}':`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const removePlaceholders = args.includes('--remove-placeholders');
  const removeAll = args.includes('--remove-all');

  console.log('🚀 Initializing GTFS Collections in Firestore...\n');

  // Check if db is available
  if (!db) {
    console.error('❌ Firestore is not configured. Please configure Firebase credentials:');
    console.error('');
    console.error('   Option 1: Set environment variables in .env:');
    console.error('     FIREBASE_PROJECT_ID=your-project-id');
    console.error('     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."');
    console.error('     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com');
    console.error('');
    console.error('   Option 2: Set GOOGLE_APPLICATION_CREDENTIALS in .env:');
    console.error('     GOOGLE_APPLICATION_CREDENTIALS=src/config/firebase-adminsdk.json');
    console.error('');
    console.error('   Option 3: Place firebase-adminsdk.json at:');
    console.error('     backend/src/config/firebase-adminsdk.json');
    console.error('');
    process.exit(1);
  }

  if (removeAll) {
    console.log('🗑️  Removing all placeholder documents...\n');
    for (const [key, collectionName] of Object.entries(GTFS_COLLECTIONS)) {
      await removePlaceholder(collectionName);
    }
    console.log('\n✅ Cleanup completed!');
    return;
  }

  try {
    let successCount = 0;
    let failCount = 0;

    // Initialize all GTFS collections
    for (const [key, collectionName] of Object.entries(GTFS_COLLECTIONS)) {
      const success = await initializeCollection(collectionName);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully initialized: ${successCount} collections`);
    if (failCount > 0) {
      console.log(`⚠️  Failed: ${failCount} collections`);
    }

    if (removePlaceholders) {
      console.log('\n🗑️  Removing placeholder documents...\n');
      for (const [key, collectionName] of Object.entries(GTFS_COLLECTIONS)) {
        await removePlaceholder(collectionName);
      }
      console.log('\n✅ Placeholders removed!');
    } else {
      console.log('\n💡 Tip: Run with --remove-placeholders to clean up placeholder documents');
      console.log('   after you have added real data to the collections.');
    }

    console.log('\n📋 Collections created:');
    for (const [key, collectionName] of Object.entries(GTFS_COLLECTIONS)) {
      console.log(`   • ${collectionName}`);
    }

    console.log('\n✅ GTFS collections initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { initializeCollection, removePlaceholder, GTFS_COLLECTIONS };

