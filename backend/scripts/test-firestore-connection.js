#!/usr/bin/env node

/**
 * Test Firestore Connection with explicit project configuration
 */

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  console.log('='.repeat(60));
  console.log('🧪 Prueba de Conexión a Firestore');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Clear any existing apps
    if (admin.apps.length > 0) {
      admin.apps.forEach(app => app.delete());
    }

    // Load credentials
    const backendRoot = path.resolve(__dirname, '..');
    const credentialsPath = path.resolve(backendRoot, 'src/config/firebase-adminsdk.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ Archivo de credenciales no encontrado:', credentialsPath);
      process.exit(1);
    }

    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    const serviceAccount = JSON.parse(credentialsContent);

    // Fix private_key if needed
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    console.log(`📋 Proyecto configurado: ${serviceAccount.project_id}`);
    console.log(`📧 Service Account: ${serviceAccount.client_email}`);
    console.log('');

    // Initialize with explicit projectId
    console.log('🔥 Inicializando Firebase Admin SDK...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('   ✓ Firebase Admin SDK inicializado');
    console.log('');

    // Test Firestore connection
    console.log('🗄️  Probando conexión a Firestore...');
    const db = admin.firestore();

    // Try to list collections
    try {
      const collections = await db.listCollections();
      console.log(`   ✅ ¡CONEXIÓN EXITOSA!`);
      console.log(`   📊 Colecciones encontradas: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log('   Colecciones:');
        collections.forEach(col => {
          console.log(`     - ${col.id}`);
        });
      } else {
        console.log('   ℹ️  No hay colecciones aún (esto es normal para un proyecto nuevo)');
      }

      // Try a simple write/read test
      console.log('');
      console.log('✍️  Probando escritura y lectura...');
      const testRef = db.collection('__connection_test').doc('test');
      await testRef.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: 'Test connection successful'
      });
      console.log('   ✓ Escritura exitosa');

      const testDoc = await testRef.get();
      if (testDoc.exists) {
        console.log('   ✓ Lectura exitosa');
      }

      // Clean up
      await testRef.delete();
      console.log('   ✓ Limpieza exitosa');

      console.log('');
      console.log('='.repeat(60));
      console.log('✅ ¡TODO FUNCIONA CORRECTAMENTE!');
      console.log('='.repeat(60));
      console.log('');
      console.log('💡 Si ves este mensaje, Firestore está configurado correctamente.');
      console.log('   Puedes ejecutar: npm run seed o npm run runseed');
      console.log('');

      process.exit(0);
    } catch (firestoreError) {
      console.error(`   ❌ Error al acceder a Firestore`);
      console.error(`   Mensaje: ${firestoreError.message}`);
      if (firestoreError.code) {
        console.error(`   Código: ${firestoreError.code}`);
      }
      console.error('');

      if (firestoreError.code === 16) {
        console.error('🔍 DIAGNÓSTICO DEL ERROR UNAUTHENTICATED:');
        console.error('');
        console.error('El proyecto en las credenciales es: ' + serviceAccount.project_id);
        console.error('');
        console.error('Posibles soluciones:');
        console.error('1. Verifica que estés en el proyecto correcto en Google Cloud Console');
        console.error('   - Ve a: https://console.cloud.google.com/');
        console.error('   - Selecciona el proyecto: ' + serviceAccount.project_id);
        console.error('   - O cambia al proyecto correcto si es necesario');
        console.error('');
        console.error('2. Verifica que Firestore esté habilitado en el proyecto:');
        console.error('   - Firebase Console: https://console.firebase.google.com/project/' + serviceAccount.project_id + '/firestore');
        console.error('   - Google Cloud: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=' + serviceAccount.project_id);
        console.error('');
        console.error('3. ⚠️  IMPORTANTE: Verifica que las credenciales sean del proyecto correcto');
        console.error('   - El project_id en el JSON debe ser: ' + serviceAccount.project_id);
        console.error('   - Configuración → Service Accounts → Generate new private key');
        console.error('   - Reemplaza el contenido de backend/src/config/firebase-adminsdk.json con el nuevo JSON');
        console.error('');
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testConnection();

