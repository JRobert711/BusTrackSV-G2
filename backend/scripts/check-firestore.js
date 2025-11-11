// Diagnostic script to check Firestore access
// Usage: node scripts/check-firestore.js

require('dotenv').config();
const path = require('path');

(async () => {
  try {
    // Import the db/admin wrapper used by the project
    const cfg = require('../src/config/db');
    const admin = cfg.admin || cfg;
    const db = cfg.db;

    console.log('== Firestore diagnostic ==');
    console.log('Admin initialized:', !!admin);
    console.log('DB object present:', !!db);

    // Try listing collections (non-destructive)
    try {
      const cols = await db.listCollections();
      console.log('Collections count:', cols.length);
    } catch (innerErr) {
      console.error('Error listing collections:');
      console.error(innerErr && innerErr.toString());
      if (innerErr && innerErr.code) console.error('Code:', innerErr.code);
      if (innerErr && innerErr.metadata) console.error('Metadata:', JSON.stringify(innerErr.metadata));
    }

    // Try a small read query (non-destructive)
    try {
      const snapshot = await db.collection('__health_check').limit(1).get();
      console.log('Health query succeeded, docs:', snapshot.size);
    } catch (qErr) {
      console.error('Error running health query:');
      console.error(qErr && qErr.toString());
      if (qErr && qErr.code) console.error('Code:', qErr.code);
      if (qErr && qErr.details) console.error('Details:', qErr.details);
      if (qErr && qErr.metadata) {
        try {
          console.error('Metadata:', JSON.stringify(qErr.metadata));
        } catch (e) {
          console.error('Metadata (toString):', qErr.metadata);
        }
      }
      if (qErr && qErr.stack) console.error('Stack:', qErr.stack);
      process.exit(1);
    }

    console.log('Diagnostic completed successfully (no permission errors detected).');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected diagnostic error:', err && err.toString());
    if (err && err.stack) console.error(err.stack);
    process.exit(2);
  }
})();