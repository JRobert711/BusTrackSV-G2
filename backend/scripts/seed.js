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

// Seed data
const ADMIN_EMAIL = 'admin@bustrack.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const ADMIN_NAME = 'System Administrator';

const SAMPLE_BUSES = [
  {
    licensePlate: 'P-123456',
    unitName: 'Ruta 29 - Bus 001',
    status: 'moving',
    route: 'Ruta 29',
    driver: 'driver-001',
    movingTime: 3600,
    parkedTime: 1200,
    isFavorite: true,
    position: {
      lat: 13.6929,
      lng: -89.2182
    }
  },
  {
    licensePlate: 'P-234567',
    unitName: 'Ruta 44 - Bus 002',
    status: 'parked',
    route: 'Ruta 44',
    driver: 'driver-002',
    movingTime: 2400,
    parkedTime: 3600,
    isFavorite: false,
    position: {
      lat: 13.7094,
      lng: -89.2036
    }
  },
  {
    licensePlate: 'P-345678',
    unitName: 'Ruta 52 - Bus 003',
    status: 'maintenance',
    route: 'Ruta 52',
    driver: null,
    movingTime: 0,
    parkedTime: 7200,
    isFavorite: false,
    position: null
  },
  {
    licensePlate: 'P-456789',
    unitName: 'Ruta 101 - Bus 004',
    status: 'moving',
    route: 'Ruta 101',
    driver: 'driver-003',
    movingTime: 5400,
    parkedTime: 600,
    isFavorite: true,
    position: {
      lat: 13.6825,
      lng: -89.2447
    }
  },
  {
    licensePlate: 'P-567890',
    unitName: 'Ruta 7C - Bus 005',
    status: 'parked',
    route: 'Ruta 7C',
    driver: 'driver-004',
    movingTime: 1800,
    parkedTime: 4800,
    isFavorite: false,
    position: {
      lat: 13.6743,
      lng: -89.2326
    }
  }
];

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

    // Seed admin user
    await seedAdmin();

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
