#!/usr/bin/env node

/**
 * Firebase Seed Script
 * Migrates mock data to Firebase (Firestore, Auth, Realtime Database)
 * 
 * Usage:
 *   node scripts/seed-firebase.js           - Seed everything
 *   node scripts/seed-firebase.js --users   - Seed only users
 *   node scripts/seed-firebase.js --buses   - Seed only buses
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { auth, db, realtimeDb } = require('../src/config/firebase-admin');

// Mock data to seed
const mockUsers = [
  { 
    email: 'admin@bustrack.com', 
    password: 'admin123', 
    name: 'Administrador', 
    role: 'admin',
    username: 'admin'
  },
  { 
    email: 'operador@bustrack.com', 
    password: 'operador123', 
    name: 'Operador', 
    role: 'operator',
    username: 'operador'
  },
];

const mockBuses = [
  { id: '001', licensePlate: 'BUS-001', unitName: 'Unidad 001', status: 'parked', route: '101', driver: 'Carlos Rodríguez', movingTime: 332, parkedTime: 110, isFavorite: false },
  { id: '002', licensePlate: 'BUS-002', unitName: 'Unidad 002', status: 'moving', route: '102', driver: 'María González', movingTime: 245, parkedTime: 45, isFavorite: true },
  { id: '003', licensePlate: 'BUS-003', unitName: 'Unidad 003', status: 'parked', route: '201', driver: 'José López', movingTime: 180, parkedTime: 90, isFavorite: false },
  { id: '004', licensePlate: 'BUS-004', unitName: 'Unidad 004', status: 'moving', route: '205', driver: 'Ana Martínez', movingTime: 420, parkedTime: 30, isFavorite: true },
  { id: '005', licensePlate: 'BUS-005', unitName: 'Unidad 005', status: 'parked', route: '301', driver: 'Luis Hernández', movingTime: 200, parkedTime: 120, isFavorite: false },
  { id: '006', licensePlate: 'BUS-006', unitName: 'Unidad 006', status: 'moving', route: '305', driver: 'Carmen Jiménez', movingTime: 380, parkedTime: 60, isFavorite: true },
  { id: '007', licensePlate: 'BUS-007', unitName: 'Unidad 007', status: 'parked', route: '401', driver: 'Roberto Silva', movingTime: 150, parkedTime: 180, isFavorite: false },
  { id: '008', licensePlate: 'BUS-008', unitName: 'Unidad 008', status: 'moving', route: '501', driver: 'Patricia Vargas', movingTime: 290, parkedTime: 75, isFavorite: true },
  { id: '009', licensePlate: 'BUS-009', unitName: 'Unidad 009', status: 'parked', route: '101', driver: 'Miguel Castillo', movingTime: 220, parkedTime: 95, isFavorite: false },
  { id: '010', licensePlate: 'BUS-010', unitName: 'Unidad 010', status: 'parked', route: '102', driver: 'Laura Morales', movingTime: 160, parkedTime: 140, isFavorite: false },
  { id: '011', licensePlate: 'BUS-011', unitName: 'Unidad 011', status: 'parked', route: '201', driver: 'Fernando Vega', movingTime: 190, parkedTime: 110, isFavorite: false },
  { id: '012', licensePlate: 'BUS-012', unitName: 'Unidad 012', status: 'parked', route: '205', driver: 'Sofía Ramírez', movingTime: 170, parkedTime: 130, isFavorite: false },
];

// Default location (San Salvador, El Salvador)
const defaultLocation = {
  latitude: 13.6929,
  longitude: -89.2182,
  timestamp: Date.now(),
};

/**
 * Seed users to Firebase Auth and Firestore
 */
async function seedUsers() {
  if (!auth || !db) {
    console.log('⚠️  Firebase Auth or Firestore not configured. Skipping user seeding.');
    return;
  }

  console.log('🌱 Seeding users...');

  for (const userData of mockUsers) {
    try {
      // Check if user already exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`   ✓ User ${userData.email} already exists`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Firebase Auth
          userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name,
          });
          console.log(`   ✓ Created user: ${userData.email}`);
        } else {
          throw error;
        }
      }

      // Create/update user document in Firestore
      if (db) {
        await db.collection('users').doc(userRecord.uid).set({
          username: userData.username,
          name: userData.name,
          role: userData.role,
          email: userData.email,
          createdAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
          updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`   ✓ Updated Firestore document for: ${userData.email}`);
      }
    } catch (error) {
      console.error(`   ✗ Error seeding user ${userData.email}:`, error.message);
    }
  }

  console.log('✅ User seeding completed\n');
}

/**
 * Seed buses to Firestore
 */
async function seedBuses() {
  if (!db) {
    console.log('⚠️  Firestore not configured. Skipping bus seeding.');
    return;
  }

  console.log('🌱 Seeding buses...');

  for (const busData of mockBuses) {
    try {
      const busRef = db.collection('buses').doc(busData.id);
      
      // Check if bus already exists
      const busDoc = await busRef.get();
      
      const busDocument = {
        licensePlate: busData.licensePlate,
        unitName: busData.unitName,
        status: busData.status,
        route: busData.route,
        driver: busData.driver,
        movingTime: busData.movingTime,
        parkedTime: busData.parkedTime,
        isFavorite: busData.isFavorite,
        updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
      };

      if (!busDoc.exists) {
        busDocument.createdAt = require('firebase-admin').firestore.FieldValue.serverTimestamp();
        await busRef.set(busDocument);
        console.log(`   ✓ Created bus: ${busData.licensePlate}`);
      } else {
        await busRef.update(busDocument);
        console.log(`   ✓ Updated bus: ${busData.licensePlate}`);
      }
    } catch (error) {
      console.error(`   ✗ Error seeding bus ${busData.licensePlate}:`, error.message);
    }
  }

  console.log('✅ Bus seeding completed\n');
}

/**
 * Seed initial locations to Realtime Database
 */
async function seedLocations() {
  if (!realtimeDb) {
    console.log('⚠️  Realtime Database not configured. Skipping location seeding.');
    return;
  }

  console.log('🌱 Seeding locations...');

  for (const busData of mockBuses) {
    try {
      // Add slight variation to default location for each bus
      const location = {
        ...defaultLocation,
        latitude: defaultLocation.latitude + (Math.random() * 0.1 - 0.05),
        longitude: defaultLocation.longitude + (Math.random() * 0.1 - 0.05),
        speed: busData.status === 'moving' ? Math.floor(Math.random() * 50) + 20 : 0,
      };

      const locationRef = realtimeDb.ref(`buses/${busData.id}/location`);
      await locationRef.set(location);
      console.log(`   ✓ Set location for bus: ${busData.licensePlate}`);
    } catch (error) {
      console.error(`   ✗ Error seeding location for bus ${busData.licensePlate}:`, error.message);
    }
  }

  console.log('✅ Location seeding completed\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const seedUsersOnly = args.includes('--users');
  const seedBusesOnly = args.includes('--buses');

  console.log('🚀 Starting Firebase seed script...\n');

  try {
    if (seedUsersOnly) {
      await seedUsers();
    } else if (seedBusesOnly) {
      await seedBuses();
      await seedLocations();
    } else {
      // Seed everything
      await seedUsers();
      await seedBuses();
      await seedLocations();
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedUsers, seedBuses, seedLocations };
