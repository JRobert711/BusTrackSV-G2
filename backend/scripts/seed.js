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
const { userRepository } = require('../src/services/userRepository');
const { busRepository } = require('../src/services/busRepository');
const User = require('../src/models/User');
const Bus = require('../src/models/Bus');
const { db } = require('../src/config/db');

// Seed data
const ADMIN_EMAIL = 'admin@bustrack.com';
// Use demo password to match frontend quick-login (demo123)
const ADMIN_PASSWORD = 'demo123';
const ADMIN_NAME = 'Carlos Administrador';
const { FieldValue } = require('firebase-admin').firestore;

// Data derived from frontend hardcoded mocks (deterministic for seed)
const ROUTES = ['101', '102', '201', '205', '301', '305', '401', '501'];
const DRIVER_NAMES = [
  'Carlos Rodríguez', 'María González', 'José López', 'Ana Martínez',
  'Luis Hernández', 'Carmen Jiménez', 'Roberto Silva', 'Patricia Vargas',
  'Miguel Castillo', 'Laura Morales', 'Fernando Vega', 'Sofía Ramírez'
];
const STATUSES = ['moving', 'parked', 'maintenance', 'needs_urgent_maintenance', 'usable'];

// Drivers (from frontend mockDrivers)
const MOCK_DRIVERS = [
  { id: 'd1', name: 'Carlos Rodríguez', phone: '+506 7777-0001', licenseNumber: 'DL-001234', status: 'active', experience: 8, assignedBus: 'BUS-001' },
  { id: 'd2', name: 'José López', phone: '+506 7777-0002', licenseNumber: 'DL-001235', status: 'active', experience: 5, assignedBus: 'BUS-003' },
  { id: 'd3', name: 'Ana Martínez', phone: '+506 7777-0003', licenseNumber: 'DL-001236', status: 'active', experience: 6, assignedBus: 'BUS-004' },
  { id: 'd4', name: 'Luis Hernández', phone: '+506 7777-0004', licenseNumber: 'DL-001237', status: 'on_leave', experience: 10 },
  { id: 'd5', name: 'Roberto Silva', phone: '+506 7777-0005', licenseNumber: 'DL-001238', status: 'active', experience: 4 }
];

// Supervisors (from frontend mockSupervisors)
const MOCK_SUPERVISORS = [
  { id: '2', name: 'María Supervisora', email: 'supervisor@bustrack.com', phone: '+506 8888-0002', department: 'Operaciones', status: 'active', joinDate: '2021-03-20' },
  { id: '3', name: 'Pedro Ramírez', email: 'pedro.ramirez@bustrack.com', phone: '+506 8888-0003', department: 'Logística', status: 'active', joinDate: '2022-05-15' },
  { id: '4', name: 'Laura Sánchez', email: 'laura.sanchez@bustrack.com', phone: '+506 8888-0004', department: 'Mantenimiento', status: 'inactive', joinDate: '2023-01-10' }
];

// Frontend mock users (admin + supervisor)
const MOCK_USERS = [
  { id: '1', email: 'admin@bustrack.com', name: 'Carlos Administrador', role: 'admin', department: 'Gerencia General', phone: '+506 8888-0001', joinDate: '2020-01-15' },
  { id: '2', email: 'supervisor@bustrack.com', name: 'María Supervisora', role: 'supervisor', department: 'Operaciones', phone: '+506 8888-0002', joinDate: '2021-03-20' }
];

// Generate 12 deterministic buses to match frontend list
const SAMPLE_BUSES = Array.from({ length: 12 }, (_, i) => {
  const idx = i + 1;
  const id = String(idx).padStart(3, '0');
  const licensePlate = `BUS-${id}`;
  const unitName = `Unidad ${licensePlate}`;
  const route = ROUTES[i % ROUTES.length];
  const driverName = DRIVER_NAMES[i % DRIVER_NAMES.length];
  const status = STATUSES[i % STATUSES.length];
  // deterministic position and times (seconds)
  const position = { lat: 20 + i * 1.5, lng: 15 + i * 2 };
  const parkedTime = (30 + i * 5) * 60; // seconds
  const movingTime = (120 + i * 10) * 60; // seconds
  const isFavorite = (i % 4) === 0;

  return {
    licensePlate,
    unitName,
    status,
    route,
    driver: driverName,
    movingTime,
    parkedTime,
    isFavorite,
    position
  };
});

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
 * Seed application users (admin + supervisors) using userRepository
 */
async function seedUsers() {
  console.log('\n👥 Seeding users (admin + supervisors)...');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

  // Ensure admin exists (uses seedAdmin logic)
  const admin = await seedAdmin();

  // Update admin extra fields (department/phone/joinDate) from MOCK_USERS if available
  try {
    const adminMock = MOCK_USERS.find(u => u.email === ADMIN_EMAIL);
    if (admin && adminMock) {
      await db.collection('users').doc(admin.id).update({
        department: adminMock.department,
        phone: adminMock.phone,
        joinDate: adminMock.joinDate,
        name: adminMock.name
      });
      console.log(`   ✓ Admin document updated with extra fields`);
    }
  } catch (err) {
    console.warn('   ! Could not update admin extra fields:', err.message);
  }

  // Create supervisors from MOCK_SUPERVISORS
  for (const sup of MOCK_SUPERVISORS) {
    try {
      const existing = await userRepository.findByEmail(sup.email);
      if (existing) {
        // update additional fields
        await db.collection('users').doc(existing.id).update({
          phone: sup.phone,
          department: sup.department,
          joinDate: sup.joinDate
        });
        console.log(`   ✓ Supervisor exists, updated: ${sup.email}`);
        continue;
      }

      const pwHash = await bcrypt.hash('demo123', saltRounds);
      const user = new User({ email: sup.email, name: sup.name, role: 'supervisor', passwordHash: pwHash });
      const created = await userRepository.create(user);
      // add extra fields directly to document
      await db.collection('users').doc(created.id).update({ phone: sup.phone, department: sup.department, joinDate: sup.joinDate });
      console.log(`   ✓ Supervisor created: ${sup.email}`);
    } catch (err) {
      console.error(`   ✗ Failed to create/update supervisor ${sup.email}:`, err.message);
    }
  }

  // Ensure MOCK_USERS (if any additional non-supervisor users) exist (skip admin since created)
  for (const u of MOCK_USERS) {
    if (u.email === ADMIN_EMAIL) continue; // admin handled
    try {
      const existing = await userRepository.findByEmail(u.email);
      if (existing) {
        await db.collection('users').doc(existing.id).update({ phone: u.phone, department: u.department, joinDate: u.joinDate, name: u.name });
        console.log(`   ✓ User exists, updated extra fields: ${u.email}`);
        continue;
      }

      const pwHash = await bcrypt.hash('demo123', saltRounds);
      const user = new User({ email: u.email, name: u.name, role: u.role, passwordHash: pwHash });
      const created = await userRepository.create(user);
      await db.collection('users').doc(created.id).update({ phone: u.phone, department: u.department, joinDate: u.joinDate });
      console.log(`   ✓ User created: ${u.email}`);
    } catch (err) {
      console.error(`   ✗ Failed to create/update user ${u.email}:`, err.message);
    }
  }
}

/**
 * Seed drivers collection directly (no repository exists for drivers)
 */
async function seedDrivers() {
  console.log('\n🚗 Seeding drivers collection...');

  for (const drv of MOCK_DRIVERS) {
    try {
      const docRef = db.collection('drivers').doc(drv.id);
      const doc = await docRef.get();
      if (doc.exists) {
        console.log(`   ⊘ Driver exists, skipping: ${drv.id} (${drv.name})`);
        continue;
      }

      await docRef.set({
        name: drv.name,
        phone: drv.phone,
        licenseNumber: drv.licenseNumber,
        status: drv.status,
        experience: drv.experience,
        assignedBus: drv.assignedBus || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      console.log(`   ✓ Driver created: ${drv.id} (${drv.name})`);
    } catch (err) {
      console.error(`   ✗ Failed to create driver ${drv.id}:`, err.message);
    }
  }
}

/**
 * Seed admin user
 */
async function seedAdmin() {
  console.log('\n📝 Seeding admin user...');

  try {
    // Check if admin already exists
    const existingAdmin = await userRepository.findByEmail(ADMIN_EMAIL);

    if (existingAdmin) {
      console.log(`   ✓ Admin user already exists: ${ADMIN_EMAIL}`);
      return existingAdmin;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    // Create admin user
    const adminUser = new User({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
      passwordHash
    });

    const createdAdmin = await userRepository.create(adminUser);
    console.log(`   ✓ Admin user created: ${ADMIN_EMAIL}`);
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`   ⚠️  REMEMBER TO CHANGE THIS PASSWORD IN PRODUCTION!`);

    return createdAdmin;
  } catch (error) {
    console.error(`   ✗ Failed to seed admin user:`, error.message);
    throw error;
  }
}

/**
 * Seed sample buses
 */
async function seedBuses() {
  console.log('\n🚌 Seeding sample buses...');

  const results = {
    created: 0,
    skipped: 0,
    failed: 0
  };

  for (const busData of SAMPLE_BUSES) {
    try {
      // Check if bus with this license plate already exists
      const existingBus = await busRepository.findByLicensePlate(busData.licensePlate);

      if (existingBus) {
        console.log(`   ⊘ Bus already exists: ${busData.licensePlate} (${busData.unitName})`);
        results.skipped++;
        continue;
      }

      // Normalize status to allowed backend values
      busData.status = normalizeStatus(busData.status);

      // Create bus
      const bus = new Bus(busData);
      await busRepository.create(bus);
      console.log(`   ✓ Bus created: ${busData.licensePlate} (${busData.unitName})`);
      results.created++;
    } catch (error) {
      console.error(`   ✗ Failed to create bus ${busData.licensePlate}:`, error.message);
      results.failed++;
    }
  }

  console.log(`\n   Summary:`);
  console.log(`   - Created: ${results.created}`);
  console.log(`   - Skipped: ${results.skipped}`);
  console.log(`   - Failed: ${results.failed}`);

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
    console.log(`   1. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('   2. Get JWT token from login response');
    console.log('   3. Use token to access protected endpoints');
    console.log('\nExample:');
    console.log('   curl -X POST http://localhost:5000/api/v1/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`     -d '{"email":"${ADMIN_EMAIL}","password":"${ADMIN_PASSWORD}"}'`);
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
