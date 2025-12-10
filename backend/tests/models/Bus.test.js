/**
 * Manual Tests for Bus Model
 *
 * Run with: node tests/models/Bus.test.js
 */

require('dotenv').config();
const Bus = require('../../src/models/Bus');

console.log('='.repeat(60));
console.log('🧪 Bus Model Test Suite');
console.log('='.repeat(60));

let passedTests = 0;
let failedTests = 0;

/**
 * Helper to run a test
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failedTests++;
  }
}

/**
 * Helper to assert condition
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Helper to assert error is thrown
 */
function assertThrows(fn, expectedMessage) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
    }
  }
}

// ============================================
// Test Suite: Bus Creation
// ============================================
console.log('\n📝 Bus Creation Tests\n');

test('Should create a valid bus', () => {
  const bus = new Bus({
    id: '1',
    licensePlate: 'ABC-123',
    unitName: 'Bus 001',
    status: 'moving'
  });

  assert(bus.id === '1', 'ID should be set');
  assert(bus.licensePlate === 'ABC-123', 'License plate should be set');
  assert(bus.unitName === 'Bus 001', 'Unit name should be set');
  assert(bus.status === 'moving', 'Status should be set');
});

test('Should convert license plate to uppercase', () => {
  const bus = new Bus({
    id: '2',
    licensePlate: 'xyz-789',
    unitName: 'Bus 002',
    status: 'parked'
  });

  assert(bus.licensePlate === 'XYZ-789', 'License plate should be uppercase');
});

test('Should trim unit name', () => {
  const bus = new Bus({
    id: '3',
    licensePlate: 'DEF-456',
    unitName: '  Bus 003  ',
    status: 'maintenance'
  });

  assert(bus.unitName === 'Bus 003', 'Unit name should be trimmed');
});

test('Should create bus with all optional fields', () => {
  const bus = new Bus({
    id: '4',
    licensePlate: 'GHI-789',
    unitName: 'Bus 004',
    status: 'moving',
    route: 'Route 1',
    driver: 'Driver 123',
    movingTime: 3600,
    parkedTime: 1800,
    isFavorite: true,
    position: { lat: 13.6929, lng: -89.2182 }
  });

  assert(bus.route === 'Route 1', 'Route should be set');
  assert(bus.driver === 'Driver 123', 'Driver should be set');
  assert(bus.movingTime === 3600, 'Moving time should be set');
  assert(bus.parkedTime === 1800, 'Parked time should be set');
  assert(bus.isFavorite === true, 'Favorite should be set');
  assert(bus.position !== null, 'Position should be set');
  assert(bus.position.lat === 13.6929, 'Latitude should match');
  assert(bus.position.lng === -89.2182, 'Longitude should match');
});

test('Should create bus without optional fields (defaults)', () => {
  const bus = new Bus({
    id: '5',
    licensePlate: 'JKL-012',
    unitName: 'Bus 005',
    status: 'parked'
  });

  assert(bus.route === null, 'Route should default to null');
  assert(bus.driver === null, 'Driver should default to null');
  assert(bus.movingTime === 0, 'Moving time should default to 0');
  assert(bus.parkedTime === 0, 'Parked time should default to 0');
  assert(bus.isFavorite === false, 'Favorite should default to false');
  assert(bus.position === null, 'Position should default to null');
});

// ============================================
// Test Suite: Status Validation
// ============================================
console.log('\n📝 Status Validation Tests\n');

test('Should accept valid status: parked', () => {
  const bus = new Bus({
    id: '6',
    licensePlate: 'MNO-345',
    unitName: 'Bus 006',
    status: 'parked'
  });
  assert(bus.status === 'parked', 'Status parked should be valid');
});

test('Should accept valid status: moving', () => {
  const bus = new Bus({
    id: '7',
    licensePlate: 'PQR-678',
    unitName: 'Bus 007',
    status: 'moving'
  });
  assert(bus.status === 'moving', 'Status moving should be valid');
});

test('Should accept valid status: maintenance', () => {
  const bus = new Bus({
    id: '8',
    licensePlate: 'STU-901',
    unitName: 'Bus 008',
    status: 'maintenance'
  });
  assert(bus.status === 'maintenance', 'Status maintenance should be valid');
});

test('Should throw clear error for invalid status', () => {
  assertThrows(() => {
    new Bus({
      id: '9',
      licensePlate: 'VWX-234',
      unitName: 'Bus 009',
      status: 'flying'
    });
  }, 'Invalid status');
});

test('Should throw error for missing status', () => {
  assertThrows(() => {
    new Bus({
      id: '10',
      licensePlate: 'YZA-567',
      unitName: 'Bus 010'
    });
  }, 'Status is required');
});

// ============================================
// Test Suite: Position Validation (Optional)
// ============================================
console.log('\n📝 Position Validation Tests (Optional)\n');

test('Position should be optional (null allowed)', () => {
  const bus = new Bus({
    id: '11',
    licensePlate: 'BCD-890',
    unitName: 'Bus 011',
    status: 'parked',
    position: null
  });

  assert(bus.position === null, 'Position should be null');
  assert(bus.hasPosition() === false, 'hasPosition() should return false');
});

test('Position should be optional (undefined allowed)', () => {
  const bus = new Bus({
    id: '12',
    licensePlate: 'EFG-123',
    unitName: 'Bus 012',
    status: 'parked'
    // position not provided
  });

  assert(bus.position === null, 'Position should be null when not provided');
});

test('Should accept valid coordinates within range', () => {
  const bus = new Bus({
    id: '13',
    licensePlate: 'HIJ-456',
    unitName: 'Bus 013',
    status: 'moving',
    position: { lat: 13.6929, lng: -89.2182 } // San Salvador
  });

  assert(bus.position.lat === 13.6929, 'Latitude should be set');
  assert(bus.position.lng === -89.2182, 'Longitude should be set');
});

test('Should accept edge case coordinates (North Pole)', () => {
  const bus = new Bus({
    id: '14',
    licensePlate: 'KLM-789',
    unitName: 'Bus 014',
    status: 'parked',
    position: { lat: 90, lng: 0 }
  });

  assert(bus.position.lat === 90, 'North Pole latitude should be valid');
});

test('Should accept edge case coordinates (South Pole)', () => {
  const bus = new Bus({
    id: '15',
    licensePlate: 'NOP-012',
    unitName: 'Bus 015',
    status: 'parked',
    position: { lat: -90, lng: 0 }
  });

  assert(bus.position.lat === -90, 'South Pole latitude should be valid');
});

test('Should accept edge case coordinates (Date Line)', () => {
  const bus = new Bus({
    id: '16',
    licensePlate: 'QRS-345',
    unitName: 'Bus 016',
    status: 'parked',
    position: { lat: 0, lng: 180 }
  });

  assert(bus.position.lng === 180, 'Date line longitude should be valid');
});

test('Should throw clear error for latitude out of range (too high)', () => {
  assertThrows(() => {
    new Bus({
      id: '17',
      licensePlate: 'TUV-678',
      unitName: 'Bus 017',
      status: 'moving',
      position: { lat: 91, lng: 0 }
    });
  }, 'Latitude must be between -90 and 90');
});

test('Should throw clear error for latitude out of range (too low)', () => {
  assertThrows(() => {
    new Bus({
      id: '18',
      licensePlate: 'WXY-901',
      unitName: 'Bus 018',
      status: 'moving',
      position: { lat: -91, lng: 0 }
    });
  }, 'Latitude must be between -90 and 90');
});

test('Should throw clear error for longitude out of range (too high)', () => {
  assertThrows(() => {
    new Bus({
      id: '19',
      licensePlate: 'ZAB-234',
      unitName: 'Bus 019',
      status: 'moving',
      position: { lat: 0, lng: 181 }
    });
  }, 'Longitude must be between -180 and 180');
});

test('Should throw clear error for longitude out of range (too low)', () => {
  assertThrows(() => {
    new Bus({
      id: '20',
      licensePlate: 'CDE-567',
      unitName: 'Bus 020',
      status: 'moving',
      position: { lat: 0, lng: -181 }
    });
  }, 'Longitude must be between -180 and 180');
});

test('Should throw error for position with missing lat', () => {
  assertThrows(() => {
    new Bus({
      id: '21',
      licensePlate: 'FGH-890',
      unitName: 'Bus 021',
      status: 'moving',
      position: { lng: -89.2182 }
    });
  }, 'Position must include both lat and lng');
});

test('Should throw error for position with missing lng', () => {
  assertThrows(() => {
    new Bus({
      id: '22',
      licensePlate: 'IJK-123',
      unitName: 'Bus 022',
      status: 'moving',
      position: { lat: 13.6929 }
    });
  }, 'Position must include both lat and lng');
});

test('Should throw error for non-numeric latitude', () => {
  assertThrows(() => {
    new Bus({
      id: '23',
      licensePlate: 'LMN-456',
      unitName: 'Bus 023',
      status: 'moving',
      position: { lat: 'north', lng: 0 }
    });
  }, 'Latitude and longitude must be numbers');
});

test('Should throw error for non-numeric longitude', () => {
  assertThrows(() => {
    new Bus({
      id: '24',
      licensePlate: 'OPQ-789',
      unitName: 'Bus 024',
      status: 'moving',
      position: { lat: 0, lng: 'west' }
    });
  }, 'Latitude and longitude must be numbers');
});

// ============================================
// Test Suite: License Plate Validation
// ============================================
console.log('\n📝 License Plate Validation Tests\n');

test('Should throw error for missing license plate', () => {
  assertThrows(() => {
    new Bus({
      id: '25',
      unitName: 'Bus 025',
      status: 'parked'
    });
  }, 'License plate is required');
});

test('Should throw error for license plate too short', () => {
  assertThrows(() => {
    new Bus({
      id: '26',
      licensePlate: 'AB',
      unitName: 'Bus 026',
      status: 'parked'
    });
  }, 'at least 3 characters');
});

test('Should accept minimum length license plate', () => {
  const bus = new Bus({
    id: '27',
    licensePlate: 'ABC',
    unitName: 'Bus 027',
    status: 'parked'
  });

  assert(bus.licensePlate === 'ABC', 'Minimum length plate should be valid');
});

// ============================================
// Test Suite: Instance Methods
// ============================================
console.log('\n📝 Instance Methods Tests\n');

test('isMoving() should return true for moving buses', () => {
  const bus = new Bus({
    id: '28',
    licensePlate: 'RST-012',
    unitName: 'Bus 028',
    status: 'moving'
  });

  assert(bus.isMoving() === true, 'isMoving() should return true');
  assert(bus.isParked() === false, 'isParked() should return false');
  assert(bus.isInMaintenance() === false, 'isInMaintenance() should return false');
});

test('isParked() should return true for parked buses', () => {
  const bus = new Bus({
    id: '29',
    licensePlate: 'UVW-345',
    unitName: 'Bus 029',
    status: 'parked'
  });

  assert(bus.isParked() === true, 'isParked() should return true');
  assert(bus.isMoving() === false, 'isMoving() should return false');
});

test('isInMaintenance() should return true for maintenance buses', () => {
  const bus = new Bus({
    id: '30',
    licensePlate: 'XYZ-678',
    unitName: 'Bus 030',
    status: 'maintenance'
  });

  assert(bus.isInMaintenance() === true, 'isInMaintenance() should return true');
  assert(bus.isMoving() === false, 'isMoving() should return false');
});

test('hasPosition() should return false when no position', () => {
  const bus = new Bus({
    id: '31',
    licensePlate: 'ABC-901',
    unitName: 'Bus 031',
    status: 'parked'
  });

  assert(bus.hasPosition() === false, 'hasPosition() should return false');
});

test('hasPosition() should return true when position is set', () => {
  const bus = new Bus({
    id: '32',
    licensePlate: 'DEF-234',
    unitName: 'Bus 032',
    status: 'moving',
    position: { lat: 13.6929, lng: -89.2182 }
  });

  assert(bus.hasPosition() === true, 'hasPosition() should return true');
});

test('updatePosition() should update bus position', () => {
  const bus = new Bus({
    id: '33',
    licensePlate: 'GHI-567',
    unitName: 'Bus 033',
    status: 'moving'
  });

  bus.updatePosition(14.0, -88.0);
  assert(bus.position.lat === 14.0, 'Latitude should be updated');
  assert(bus.position.lng === -88.0, 'Longitude should be updated');
});

test('clearPosition() should remove bus position', () => {
  const bus = new Bus({
    id: '34',
    licensePlate: 'JKL-890',
    unitName: 'Bus 034',
    status: 'parked',
    position: { lat: 13.6929, lng: -89.2182 }
  });

  bus.clearPosition();
  assert(bus.position === null, 'Position should be null after clearing');
});

test('toggleFavorite() should toggle favorite status', () => {
  const bus = new Bus({
    id: '35',
    licensePlate: 'MNO-123',
    unitName: 'Bus 035',
    status: 'parked',
    isFavorite: false
  });

  bus.toggleFavorite();
  assert(bus.isFavorite === true, 'Favorite should be true after toggle');

  bus.toggleFavorite();
  assert(bus.isFavorite === false, 'Favorite should be false after second toggle');
});

// ============================================
// Test Suite: toJSON() Method
// ============================================
console.log('\n📝 toJSON() Method Tests\n');

test('toJSON() should include all fields', () => {
  const bus = new Bus({
    id: '36',
    licensePlate: 'PQR-456',
    unitName: 'Bus 036',
    status: 'moving',
    route: 'Route 1',
    driver: 'Driver 1',
    movingTime: 1000,
    parkedTime: 500,
    isFavorite: true,
    position: { lat: 13.6929, lng: -89.2182 }
  });

  const json = bus.toJSON();

  assert(json.id === '36', 'toJSON() should include id');
  assert(json.licensePlate === 'PQR-456', 'toJSON() should include licensePlate');
  assert(json.unitName === 'Bus 036', 'toJSON() should include unitName');
  assert(json.status === 'moving', 'toJSON() should include status');
  assert(json.route === 'Route 1', 'toJSON() should include route');
  assert(json.driver === 'Driver 1', 'toJSON() should include driver');
  assert(json.movingTime === 1000, 'toJSON() should include movingTime');
  assert(json.parkedTime === 500, 'toJSON() should include parkedTime');
  assert(json.isFavorite === true, 'toJSON() should include isFavorite');
  assert(json.position !== null, 'toJSON() should include position');
});

// ============================================
// Test Suite: Static Methods
// ============================================
console.log('\n📝 Static Methods Tests\n');

test('collection() should return correct collection name', () => {
  assert(Bus.collection() === 'buses', 'collection() should return "buses"');
});

test('getAllowedStatuses() should return allowed statuses', () => {
  const statuses = Bus.getAllowedStatuses();
  assert(Array.isArray(statuses), 'getAllowedStatuses() should return an array');
  assert(statuses.includes('parked'), 'Should include parked status');
  assert(statuses.includes('moving'), 'Should include moving status');
  assert(statuses.includes('maintenance'), 'Should include maintenance status');
  assert(statuses.length === 3, 'Should have exactly 3 statuses');
});

test('fromDatabase() should create Bus from database document', () => {
  const doc = {
    id: '37',
    licensePlate: 'STU-789',
    unitName: 'Bus 037',
    status: 'parked',
    route: 'Route 2',
    driver: 'Driver 2',
    movingTime: 2000,
    parkedTime: 1000,
    isFavorite: false,
    position: { lat: 13.6929, lng: -89.2182 }
  };

  const bus = Bus.fromDatabase(doc);
  assert(bus instanceof Bus, 'Should return a Bus instance');
  assert(bus.id === '37', 'Should have correct id');
  assert(bus.licensePlate === 'STU-789', 'Should have correct license plate');
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 Test Results');
console.log('='.repeat(60));
console.log(`Total Tests: ${passedTests + failedTests}`);
console.log(`✓ Passed: ${passedTests}`);
console.log(`✗ Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n✅ All tests passed!');
  console.log('='.repeat(60));
  process.exit(0);
} else {
  console.log(`\n❌ ${failedTests} test(s) failed`);
  console.log('='.repeat(60));
  process.exit(1);
}
