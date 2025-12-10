/**
 * Database Seed Script
 *
 * Seeds the database with initial data for development purposes.
 *
 * ⚠️  DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION
 *
 * Usage:
 *   node scripts/seed.js
 *
 * This script is idempotent - it can be run multiple times without duplicating data.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Bus = require('../src/models/Bus');
const { db } = require('../src/config/db');
const { FieldValue } = require('firebase-admin').firestore;

const BUS_DOC_ID = 'peeba1';
const GENERIC_LICENSE_PLATE = 'GENERIC-PLATE';
const SINGLE_DRIVER = {
  id: 'driver-peeba1',
  name: 'Conductor Peeba1',
  phone: '+000 0000-0000',
  licenseNumber: 'GEN-DRIVER-001',
  status: 'active',
  experience: 5,
  assignedBus: BUS_DOC_ID
};

// Seed data (only two users: admin + supervisor)
const USERS = [
  {
    id: 'admin',
    email: 'admin@example.com',
    name: 'Carlos Administrador',
    role: 'admin',
    password: 'demo123',
    department: 'Gerencia General',
    phone: '+506 8888-0001',
    joinDate: '2020-01-15'
  },
  {
    id: 'supervisor',
    email: 'supervisor@example.com',
    name: 'María Supervisora',
    role: 'supervisor',
    password: 'demo123',
    department: 'Operaciones',
    phone: '+506 8888-0002',
    joinDate: '2021-03-20'
  }
];

const ADMIN_USER = USERS.find(u => u.role === 'admin');
const SUPERVISOR_USER = USERS.find(u => u.role === 'supervisor');

const ROUTES = ['101', '102', '201', '205', '301', '305', '401', '501'];

// Supervisors (from frontend mockSupervisors)
const MOCK_SUPERVISORS = [
  { id: '2', name: 'María Supervisora', email: 'supervisor@bustrack.com', phone: '+506 8888-0002', department: 'Operaciones', status: 'active', joinDate: '2021-03-20' },
  { id: '3', name: 'Pedro Ramírez', email: 'pedro.ramirez@bustrack.com', phone: '+506 8888-0003', department: 'Logística', status: 'active', joinDate: '2022-05-15' },
  { id: '4', name: 'Laura Sánchez', email: 'laura.sanchez@bustrack.com', phone: '+506 8888-0004', department: 'Mantenimiento', status: 'inactive', joinDate: '2023-01-10' }
];

// Single bus: peeba1
const SAMPLE_BUSES = [
  {
    licensePlate: GENERIC_LICENSE_PLATE,
    unitName: BUS_DOC_ID,
    status: 'parked',
    route: ROUTES[0],
    driver: SINGLE_DRIVER.name,
    movingTime: 120 * 60, // seconds
    parkedTime: 30 * 60, // seconds
    isFavorite: false,
    position: { lat: 20, lng: 15 }
  }
];

// Normalize statuses to allowed values in backend model
function normalizeStatus(status) {
  if (!status) return 'parked';
  if (['moving', 'parked', 'maintenance'].includes(status)) return status;
  if (status === 'needs_urgent_maintenance') return 'maintenance';
  if (status === 'usable') return 'parked';
  // fallback
  return 'parked';
}

/**
 * Seed application users (admin + supervisor only, fixed IDs)
 */
async function seedUsers() {
  console.log('\n👥 Seeding users (solo admin y supervisor)...');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

  // Remove all existing users
  try {
    const existing = await db.collection('users').get();
    if (!existing.empty) {
      const deletePromises = existing.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`   ✓ Usuarios anteriores eliminados: ${existing.size}`);
    } else {
      console.log('   ⊘ No hay usuarios existentes para eliminar');
    }
  } catch (err) {
    console.error('   ✗ Error eliminando usuarios existentes:', err.message);
  }

  // Create fixed admin + supervisor with IDs matching roles
  for (const u of USERS) {
    try {
      const passwordHash = await bcrypt.hash(u.password, saltRounds);
      const user = new User({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash
      });

      const payload = {
        ...user.toDatabase(),
        department: u.department,
        phone: u.phone,
        joinDate: u.joinDate,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(u.id).set(payload);
      console.log(`   ✓ Usuario creado: ${u.id} (${u.email})`);
    } catch (err) {
      console.error(`   ✗ Error creando usuario ${u.email}:`, err.message);
    }
  }
}

/**
 * Seed drivers collection directly (no repository exists for drivers)
 */
async function seedDrivers() {
  console.log('\n🚗 Seeding drivers collection (reemplazando por único conductor)...');

  try {
    const existingDrivers = await db.collection('drivers').get();
    if (!existingDrivers.empty) {
      const deletePromises = existingDrivers.docs.map(async (doc) => {
        try {
          await doc.ref.delete();
          return true;
        } catch (error) {
          console.error(`   ✗ Error eliminando conductor ${doc.id}:`, error.message);
          return false;
        }
      });
      await Promise.all(deletePromises);
      console.log(`   ✓ Conductores anteriores eliminados: ${existingDrivers.size}`);
    } else {
      console.log('   ⊘ No hay conductores existentes para eliminar');
    }
  } catch (error) {
    console.error('   ✗ Error al eliminar conductores existentes:', error.message);
  }

  try {
    await db.collection('drivers').doc(SINGLE_DRIVER.id).set({
      name: SINGLE_DRIVER.name,
      phone: SINGLE_DRIVER.phone,
      licenseNumber: SINGLE_DRIVER.licenseNumber,
      status: SINGLE_DRIVER.status,
      experience: SINGLE_DRIVER.experience,
      assignedBus: SINGLE_DRIVER.assignedBus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log(`   ✓ Conductor creado: ${SINGLE_DRIVER.name} asignado a ${BUS_DOC_ID}`);
  } catch (err) {
    console.error(`   ✗ Failed to create driver ${SINGLE_DRIVER.id}:`, err.message);
  }
}

/**
 * Seed sample buses
 * Deletes all existing buses and creates only peeba1
 */
async function seedBuses() {
  console.log('\n🚌 Seeding sample buses...');

  const results = {
    deleted: 0,
    created: 0,
    failed: 0
  };

  try {
    // Delete all existing buses first
    console.log('   🗑️  Eliminando buses existentes...');
    const allBusesSnapshot = await db.collection('buses').get();
    
    if (!allBusesSnapshot.empty) {
      const deletePromises = allBusesSnapshot.docs.map(async (doc) => {
        try {
          await doc.ref.delete();
          return true;
        } catch (error) {
          console.error(`   ✗ Error eliminando bus ${doc.id}:`, error.message);
          return false;
        }
      });
      
      const deleteResults = await Promise.all(deletePromises);
      results.deleted = deleteResults.filter(r => r).length;
      console.log(`   ✓ Eliminados ${results.deleted} buses existentes`);
    } else {
      console.log('   ⊘ No hay buses existentes para eliminar');
    }
  } catch (error) {
    console.error('   ✗ Error al eliminar buses existentes:', error.message);
    results.failed++;
  }

  // Create only peeba1 with fixed document ID and generic license plate
  for (const busData of SAMPLE_BUSES) {
    try {
      // Normalize status to allowed backend values
      busData.status = normalizeStatus(busData.status);

      const bus = new Bus({ id: BUS_DOC_ID, ...busData });
      const payload = {
        ...bus.toDatabase(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('buses').doc(BUS_DOC_ID).set(payload);
      console.log(`   ✓ Bus creado con ID "${BUS_DOC_ID}" y placa ${busData.licensePlate}`);
      results.created++;
    } catch (error) {
      console.error(`   ✗ Failed to create bus ${busData.licensePlate}:`, error.message);
      results.failed++;
    }
  }

  console.log(`\n   Summary:`);
  console.log(`   - Eliminados: ${results.deleted}`);
  console.log(`   - Creados: ${results.created}`);
  console.log(`   - Fallidos: ${results.failed}`);

  return results;
}

/**
 * Main seed function
 */
async function seed() {
  console.log('='.repeat(60));
  console.log('🌱 Database Seed Script');
  console.log('='.repeat(60));
  console.log('\n⚠️  DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION');
  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);

  // Safety check for production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ ERROR: Seed script cannot be run in production!');
    console.error('   Set NODE_ENV to "development" to proceed.');
    process.exit(1);
  }

  try {
    // Firebase is auto-initialized when importing repositories
    console.log('\n🔥 Connecting to Firebase...');

  // Seed users (admin + supervisors)
  await seedUsers();

  // Seed drivers collection
  await seedDrivers();

  // Seed buses
  await seedBuses();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed completed successfully!');
    console.log('='.repeat(60));
    console.log('\n🚀 You can now:');
    if (ADMIN_USER) {
      console.log(`   1. Login with: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    }
    console.log('   2. Get JWT token from login response');
    console.log('   3. Use token to access protected endpoints');
    if (ADMIN_USER) {
      console.log('\nExample:');
      console.log('   curl -X POST http://localhost:5000/api/v1/auth/login \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log(`     -d '{"email":"${ADMIN_USER.email}","password":"${ADMIN_USER.password}"}'`);
    }
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Seed failed!');
    console.error('='.repeat(60));
    console.error('\nError:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.error('\n');
    process.exit(1);
  }
}

// Run seed
seed();
