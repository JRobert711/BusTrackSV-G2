#!/usr/bin/env node

/**
 * Firebase Diagnosis Script
 * 
 * Diagnoses Firebase connection issues by checking:
 * - Credentials file exists and is readable
 * - JSON format is valid
 * - Required fields are present
 * - Firebase Admin initialization
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('='.repeat(60));
  console.log('🔍 Diagnóstico de Firebase');
  console.log('='.repeat(60));
  console.log('');

  // Check 1: Environment variables
  console.log('📋 Verificando variables de entorno...');
  const { GOOGLE_APPLICATION_CREDENTIALS } = require('../src/config/env').firebase;
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${GOOGLE_APPLICATION_CREDENTIALS || 'NO CONFIGURADO'}`);
  console.log('');

  // Check 2: File exists
  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS no está configurado en .env');
    process.exit(1);
  }

  const backendRoot = path.resolve(__dirname, '..');
  const credentialsPath = path.resolve(backendRoot, GOOGLE_APPLICATION_CREDENTIALS);

  console.log('📁 Verificando archivo de credenciales...');
  console.log(`   Ruta: ${credentialsPath}`);
  console.log(`   Existe: ${fs.existsSync(credentialsPath) ? '✓ SÍ' : '✗ NO'}`);

  if (!fs.existsSync(credentialsPath)) {
    console.error(`\n❌ El archivo no existe: ${credentialsPath}`);
    process.exit(1);
  }
  console.log('');

  // Check 3: Read and parse JSON
  console.log('📖 Leyendo y validando JSON...');
  try {
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    console.log('   ✓ JSON válido');
    console.log(`   project_id: ${credentials.project_id || 'FALTANTE'}`);
    console.log(`   client_email: ${credentials.client_email || 'FALTANTE'}`);
    console.log(`   private_key: ${credentials.private_key ? `${credentials.private_key.substring(0, 30)}...` : 'FALTANTE'}`);
    console.log(`   type: ${credentials.type || 'FALTANTE'}`);
    
    // Check required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    
    if (missingFields.length > 0) {
      console.error(`\n❌ Campos faltantes: ${missingFields.join(', ')}`);
      process.exit(1);
    }
    
    // Check private_key format
    if (!credentials.private_key.includes('BEGIN PRIVATE KEY')) {
      console.warn('   ⚠️  private_key no parece tener el formato correcto');
    }
    
    // Check if private_key has proper line breaks
    const hasNewlines = credentials.private_key.includes('\n');
    console.log(`   private_key tiene saltos de línea: ${hasNewlines ? '✓ SÍ' : '⚠️  NO (puede ser un problema)'}`);
    
  } catch (error) {
    console.error(`\n❌ Error al leer/parsear JSON: ${error.message}`);
    process.exit(1);
  }
  console.log('');

  // Check 4: Try to initialize Firebase Admin
  console.log('🔥 Intentando inicializar Firebase Admin SDK...');
  try {
    // Clear any existing apps
    const admin = require('firebase-admin');
    if (admin.apps.length > 0) {
      admin.apps.forEach(app => app.delete());
    }
    
    // Load credentials
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    let serviceAccount = JSON.parse(credentialsContent);
    
    // Fix private_key if needed
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    // Initialize
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('   ✓ Firebase Admin SDK inicializado');
    
    // Check 5: Try to access Firestore
    console.log('\n🗄️  Intentando acceder a Firestore...');
    const db = admin.firestore();
    
    // Try a simple operation
    try {
      const collections = await db.listCollections();
      console.log(`   ✓ Conexión exitosa! Colecciones encontradas: ${collections.length}`);
      if (collections.length > 0) {
        console.log('   Colecciones:');
        collections.forEach(col => {
          console.log(`     - ${col.id}`);
        });
      }
    } catch (firestoreError) {
      console.error(`   ✗ Error al acceder a Firestore: ${firestoreError.message}`);
      if (firestoreError.code) {
        console.error(`   Código: ${firestoreError.code}`);
      }
      
      if (firestoreError.code === 16) {
        console.error('\n💡 Posibles causas del error UNAUTHENTICATED:');
        console.error('   1. Las credenciales están expiradas o fueron revocadas');
        console.error('   2. El service account no tiene permisos para Firestore');
        console.error('   3. Firestore no está habilitado en el proyecto "tibitribial"');
        console.error('   4. El proyecto_id en el JSON no coincide con el proyecto real');
        console.error('\n   Soluciones:');
        console.error('   - Verifica en Firebase Console que Firestore esté habilitado');
        console.error('   - Genera nuevas credenciales del service account');
        console.error('   - Verifica que el service account tenga el rol "Cloud Datastore User" o "Editor"');
      }
      
      process.exit(1);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnóstico completado - Todo está correcto!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error(`\n❌ Error al inicializar Firebase: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run diagnosis
diagnose().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});

