#!/usr/bin/env node

/**
 * Firebase Connection Verification Script
 * 
 * Verifies that Firebase Firestore is properly connected and accessible.
 * 
 * Usage:
 *   node scripts/verify-firebase.js
 */

require('dotenv').config();
const { db } = require('../src/config/db');

async function verifyConnection() {
  console.log('='.repeat(60));
  console.log('🔥 Verificando conexión de Firebase Firestore...');
  console.log('='.repeat(60));
  console.log('');

  if (!db) {
    console.error('❌ ERROR: Firebase Firestore no está inicializado');
    console.error('   Verifica tu configuración de Firebase en .env o firebase-adminsdk.json');
    process.exit(1);
  }

  try {
    // Test 1: List collections
    console.log('📋 Test 1: Listando colecciones...');
    const collections = await db.listCollections();
    console.log(`   ✓ Conexión exitosa. Colecciones encontradas: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Colecciones:');
      collections.forEach(col => {
        console.log(`     - ${col.id}`);
      });
    }
    console.log('');

    // Test 2: Try to read from a collection (non-destructive)
    console.log('📖 Test 2: Probando lectura de datos...');
    const testCollection = db.collection('buses');
    const snapshot = await testCollection.limit(1).get();
    console.log(`   ✓ Lectura exitosa. Documentos en 'buses': ${snapshot.size}`);
    console.log('');

    // Test 3: Try to write a test document (then delete it)
    console.log('✍️  Test 3: Probando escritura de datos...');
    const testDocRef = db.collection('__test_connection').doc('verify');
    await testDocRef.set({
      timestamp: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
      message: 'Test connection'
    });
    console.log('   ✓ Escritura exitosa');
    
    // Clean up test document
    await testDocRef.delete();
    console.log('   ✓ Limpieza exitosa');
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ ¡Conexión de Firebase verificada correctamente!');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ ERROR al verificar conexión de Firebase');
    console.error('='.repeat(60));
    console.error('');
    console.error('Detalles del error:');
    console.error(`   Mensaje: ${error.message}`);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.error('');
    process.exit(1);
  }
}

// Run verification
verifyConnection();

