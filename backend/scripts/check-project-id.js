#!/usr/bin/env node

/**
 * Script para verificar el project_id correcto del proyecto
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('🔍 Verificación del Project ID');
console.log('='.repeat(60));
console.log('');

const backendRoot = path.resolve(__dirname, '..');
const credentialsPath = path.resolve(backendRoot, 'src/config/firebase-adminsdk.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Archivo de credenciales no encontrado');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

console.log('📋 Información del archivo JSON:');
console.log(`   project_id: ${credentials.project_id}`);
console.log(`   client_email: ${credentials.client_email}`);
console.log(`   private_key_id: ${credentials.private_key_id}`);
console.log('');

console.log('💡 IMPORTANTE:');
console.log('');
console.log('El project_id en el JSON debe coincidir con el project_id real del proyecto.');
console.log('');
console.log('Para verificar el project_id correcto:');
console.log('1. Ve a: https://console.firebase.google.com/');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Configuración del proyecto (⚙️) → General');
console.log('4. Busca "ID del proyecto" - ese es el project_id que debe estar en el JSON');
console.log('');
console.log('El project_id actual en el JSON es: ' + credentials.project_id);
console.log('Si es diferente, necesitas generar nuevas credenciales desde el proyecto correcto.');
console.log('');
console.log('Para verificar si Firestore está habilitado:');
console.log(`- Firebase: https://console.firebase.google.com/project/${credentials.project_id}/firestore`);
console.log(`- Google Cloud: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=${credentials.project_id}`);
console.log('');

