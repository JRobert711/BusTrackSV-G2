/**
 * Run Seed Script - Reseeds bus and driver collections in a linked way.
 *
 * This script now:
 * - Deletes all buses and creates a single bus whose Firestore document ID is "peeba1"
 * - Uses a generic license plate for that bus
 * - Deletes all drivers and creates a single driver assigned to the peeba1 bus
 * - Reemplaza la colección de notificaciones con un set mínimo usado por el frontend
 *
 * Usage:
 *   node scripts/runseed.js
 */

require('dotenv').config();
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

// Notificaciones mínimas alineadas con el panel del frontend (una por tipo)
// Se guardan en la colección "notifications" (top-level)
const SAMPLE_NOTIFICATIONS = [
  {
    id: 'notification-maintenance',
    type: 'notification',
    busId: BUS_DOC_ID,
    busPlate: GENERIC_LICENSE_PLATE,
    route: '101',
    fromUserId: 'system',
    fromName: 'Sistema',
    fromRole: 'admin',
    content: `Bus ${BUS_DOC_ID} en mantenimiento programado. Conductor: ${SINGLE_DRIVER.name}.`,
    read: false,
    severity: 'info',
    metadata: { driver: SINGLE_DRIVER.name }
  },
  {
    id: 'warning-parked-too-long',
    type: 'warning',
    busId: BUS_DOC_ID,
    busPlate: GENERIC_LICENSE_PLATE,
    route: '101',
    fromUserId: 'system',
    fromName: 'Sistema',
    fromRole: 'admin',
    content: `Bus ${BUS_DOC_ID} estacionado por más de 2 horas. Verificar estado.`,
    read: false,
    severity: 'warning',
    metadata: { parkedTimeSeconds: 10800 }
  }
];

// Single bus: document ID peeba1 with generic license plate
const SAMPLE_BUSES = [
  {
    licensePlate: GENERIC_LICENSE_PLATE,
    unitName: BUS_DOC_ID,
    status: 'parked',
    route: '101',
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
 * Seed buses only - deletes all existing buses and creates peeba1
 * with document ID "peeba1" and generic license plate
 */
async function seedBuses() {
  console.log('\n🚌 Seeding buses (eliminando existentes y creando solo peeba1)...');

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

  // Create only peeba1
  for (const busData of SAMPLE_BUSES) {
    try {
      // Normalize status to allowed backend values
      busData.status = normalizeStatus(busData.status);

      // Validate bus data with model and persist with fixed document ID
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
 * Replace drivers collection with a single driver assigned to the bus
 */
async function reseedDriversForBus() {
  console.log('\n🚗 Reseeding drivers (eliminando existentes y dejando uno asignado)...');

  const results = {
    deleted: 0,
    created: 0,
    failed: 0
  };

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

      const deleteResults = await Promise.all(deletePromises);
      results.deleted = deleteResults.filter(Boolean).length;
      console.log(`   ✓ Eliminados ${results.deleted} conductores existentes`);
    } else {
      console.log('   ⊘ No hay conductores existentes para eliminar');
    }
  } catch (error) {
    console.error('   ✗ Error al eliminar conductores existentes:', error.message);
    results.failed++;
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
    results.created = 1;
    console.log(`   ✓ Conductor creado: ${SINGLE_DRIVER.name} asignado a ${BUS_DOC_ID}`);
  } catch (error) {
    console.error(`   ✗ Error creando el conductor asignado a ${BUS_DOC_ID}:`, error.message);
    results.failed++;
  }

  return results;
}

/**
 * Replace notifications collection with minimal sample (one per frontend type)
 */
async function reseedNotifications() {
  console.log('\n🔔 Reseeding notifications (una por tipo)...');

  const results = { deleted: 0, created: 0, failed: 0 };

  try {
    const existing = await db.collection('notifications').get();
    if (!existing.empty) {
      const deletePromises = existing.docs.map(doc => doc.ref.delete());
      const deleteResults = await Promise.all(deletePromises);
      results.deleted = deleteResults.filter(Boolean).length;
      console.log(`   ✓ Notificaciones anteriores eliminadas: ${results.deleted}`);
    } else {
      console.log('   ⊘ No hay notificaciones existentes para eliminar');
    }
  } catch (error) {
    console.error('   ✗ Error eliminando notificaciones existentes:', error.message);
    results.failed++;
  }

  for (const notif of SAMPLE_NOTIFICATIONS) {
    try {
      await db.collection('notifications').doc(notif.id).set({
        ...notif,
        timestamp: FieldValue.serverTimestamp(),
        read: notif.read ?? false,
        readAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      results.created++;
      console.log(`   ✓ Notificación creada: ${notif.id} (${notif.type})`);
    } catch (error) {
      console.error(`   ✗ Error creando notificación ${notif.id}:`, error.message);
      results.failed++;
    }
  }

  return results;
}

/**
 * Main runseed function
 * Modifies buses, drivers y notificaciones; preserva el resto
 */
async function runseed() {
  console.log('='.repeat(60));
  console.log('🌱 Run Seed Script - Preservando datos existentes');
  console.log('='.repeat(60));
  console.log('\n⚠️  DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION');
  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📋 Este script:');
  console.log('   ✓ Preserva todos los datos existentes excepto buses, drivers y notifications');
  console.log('   ✓ Elimina todos los buses, conductores y notifications existentes');
  console.log('   ✓ Crea solo el bus "peeba1" con placa genérica');
  console.log('   ✓ Crea un único conductor asignado al bus "peeba1"');
  console.log('   ✓ Crea una notificación por tipo (notification, warning) usada en el frontend');

  // Safety check for production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ ERROR: Seed script cannot be run in production!');
    console.error('   Set NODE_ENV to "development" to proceed.');
    process.exit(1);
  }

  try {
    // Firebase is auto-initialized when importing repositories
    console.log('\n🔥 Conectando a Firebase...');

    // Seed buses then drivers linked to that bus
    await seedBuses();
    await reseedDriversForBus();
    await reseedNotifications();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Run Seed completado exitosamente!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumen:');
    console.log('   - Todos los datos existentes fueron preservados salvo buses y drivers');
    console.log('   - Bus "peeba1" creado con placa genérica y ID de documento fijo');
    console.log('   - Conductor único creado y asignado al bus "peeba1"');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Run Seed falló!');
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
runseed();

