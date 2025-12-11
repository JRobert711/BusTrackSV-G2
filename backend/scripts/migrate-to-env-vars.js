#!/usr/bin/env node

/**
 * Script para migrar credenciales de Firebase de archivo JSON a variables de entorno
 * 
 * Este script lee el archivo firebase-adminsdk.json y genera las variables de entorno
 * necesarias para usar en lugar del archivo JSON.
 */

const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, '../src/config/firebase-adminsdk.json');
const envExamplePath = path.join(__dirname, '../.env.example');

try {
  // Leer el archivo de credenciales
  if (!fs.existsSync(credentialsPath)) {
    console.error('❌ No se encontró el archivo de credenciales en:', credentialsPath);
    console.log('\n💡 Si ya migraste a variables de entorno, puedes ignorar este mensaje.');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  console.log('='.repeat(60));
  console.log('🔐 Migración de Credenciales Firebase a Variables de Entorno');
  console.log('='.repeat(60));
  console.log('');

  // Generar variables de entorno
  const envVars = {
    FIREBASE_PROJECT_ID: credentials.project_id,
    FIREBASE_CLIENT_EMAIL: credentials.client_email,
    FIREBASE_PRIVATE_KEY: credentials.private_key.replace(/\n/g, '\\n'),
  };

  // Convertir a base64
  const base64Credentials = Buffer.from(JSON.stringify(credentials)).toString('base64');

  console.log('📋 Agrega estas variables a tu archivo .env:\n');
  console.log('# Firebase Configuration');
  console.log(`FIREBASE_PROJECT_ID=${envVars.FIREBASE_PROJECT_ID}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${envVars.FIREBASE_CLIENT_EMAIL}`);
  console.log(`FIREBASE_PRIVATE_KEY="${envVars.FIREBASE_PRIVATE_KEY}"`);
  console.log('');
  console.log('# O usa Base64 (más seguro para CI/CD):');
  console.log(`FIREBASE_SERVICE_ACCOUNT_BASE64=${base64Credentials}`);
  console.log('');

  // Crear/actualizar .env.example
  let envExampleContent = '';
  if (fs.existsSync(envExamplePath)) {
    envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  }

  if (!envExampleContent.includes('FIREBASE_PROJECT_ID')) {
    const newEnvExample = envExampleContent + `
# Firebase Configuration
# Opción 1: Variables individuales
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# Opción 2: Base64 (recomendado para producción)
# FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-json>
`;
    
    fs.writeFileSync(envExamplePath, newEnvExample.trim() + '\n');
    console.log('✅ Actualizado .env.example');
  }

  console.log('='.repeat(60));
  console.log('✅ Migración completada');
  console.log('='.repeat(60));
  console.log('');
  console.log('📝 Próximos pasos:');
  console.log('1. Copia las variables de arriba a tu archivo .env');
  console.log('2. Reinicia tu servidor');
  console.log('3. Verifica que funciona: node scripts/diagnose-firebase.js');
  console.log('4. El archivo JSON ya no es necesario (pero mantenlo localmente)');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

