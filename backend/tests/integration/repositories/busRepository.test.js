/**
 * BusRepository Integration Tests
 *
 * Tests BusRepository against Firestore Emulator.
 * 
 * Prerequisites:
 * - Firestore Emulator must be running
 * - Start with: firebase emulators:start --only firestore
 */

const { initializeTestFirebase, clearCollection } = require('./setup');
const { FirestoreBusRepository } = require('../../../src/services/busRepository');
const Bus = require('../../../src/models/Bus');

describe('BusRepository Integration Tests', () => {
  let db;
  let busRepository;

  beforeAll(() => {
    const { db: testDb } = initializeTestFirebase();
    db = testDb;
    busRepository = new FirestoreBusRepository(db);
  });

  beforeEach(async () => {
    // Clean buses collection before each test
    await clearCollection(db, 'buses');
  });

  afterAll(async () => {
    // Clean up after all tests
    await clearCollection(db, 'buses');
  });

  describe('create', () => {
    test('should create a new bus', async () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked',
        route: 'Route 1',
        driver: 'driver123'
      });

      const created = await busRepository.create(bus);

      expect(created).toBeInstanceOf(Bus);
      expect(created.id).toBeDefined();
      expect(created.licensePlate).toBe('ABC-123');
      expect(created.unitName).toBe('Bus 001');
      expect(created.status).toBe('parked');
    });

    test('should throw error for duplicate license plate', async () => {
      const bus1 = new Bus({
        licensePlate: 'DUP-123',
        unitName: 'Bus 1',
        status: 'parked'
      });

      await busRepository.create(bus1);

      const bus2 = new Bus({
        licensePlate: 'DUP-123',
        unitName: 'Bus 2',
        status: 'moving'
      });

      await expect(busRepository.create(bus2)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    test('should find bus by id', async () => {
      const bus = new Bus({
        licensePlate: 'FIND-123',
        unitName: 'Find Bus',
        status: 'moving'
      });

      const created = await busRepository.create(bus);

      const found = await busRepository.findById(created.id);

      expect(found).toBeInstanceOf(Bus);
      expect(found.id).toBe(created.id);
      expect(found.licensePlate).toBe('FIND-123');
    });

    test('should return null for non-existent id', async () => {
      const found = await busRepository.findById('nonexistent_id');

      expect(found).toBeNull();
    });
  });

  describe('findByLicensePlate', () => {
    test('should find bus by license plate', async () => {
      const bus = new Bus({
        licensePlate: 'LP-123',
        unitName: 'License Plate Bus',
        status: 'parked'
      });

      await busRepository.create(bus);

      const found = await busRepository.findByLicensePlate('LP-123');

      expect(found).toBeInstanceOf(Bus);
      expect(found.licensePlate).toBe('LP-123');
    });

    test('should return null for non-existent license plate', async () => {
      const found = await busRepository.findByLicensePlate('NONEXISTENT');

      expect(found).toBeNull();
    });

    test('should be case-insensitive', async () => {
      const bus = new Bus({
        licensePlate: 'CASE-123',
        unitName: 'Case Bus',
        status: 'parked'
      });

      await busRepository.create(bus);

      const found = await busRepository.findByLicensePlate('case-123');

      expect(found).toBeInstanceOf(Bus);
      expect(found.licensePlate).toBe('CASE-123');
    });
  });

  describe('update', () => {
    test('should update bus fields', async () => {
      const bus = new Bus({
        licensePlate: 'UPD-123',
        unitName: 'Original Name',
        status: 'parked',
        route: 'Route 1'
      });

      const created = await busRepository.create(bus);

      // Update bus
      created.unitName = 'Updated Name';
      created.status = 'moving';
      created.route = 'Route 2';

      const updated = await busRepository.update(created);

      expect(updated.unitName).toBe('Updated Name');
      expect(updated.status).toBe('moving');
      expect(updated.route).toBe('Route 2');
    });

    test('should throw error for non-existent bus', async () => {
      const bus = new Bus({
        id: 'nonexistent_id',
        licensePlate: 'TEST-123',
        unitName: 'Test',
        status: 'parked'
      });

      await expect(busRepository.update(bus)).rejects.toThrow('Bus not found');
    });
  });

  describe('updatePosition', () => {
    test('should update bus GPS position', async () => {
      const bus = new Bus({
        licensePlate: 'POS-123',
        unitName: 'Position Bus',
        status: 'moving',
        position: { lat: 13.0, lng: -89.0 }
      });

      const created = await busRepository.create(bus);

      const updated = await busRepository.updatePosition(created.id, 14.0, -90.0);

      expect(updated.position).toEqual({ lat: 14.0, lng: -90.0 });
    });

    test('should throw error for non-existent bus', async () => {
      await expect(busRepository.updatePosition('nonexistent_id', 13.0, -89.0))
        .rejects.toThrow('Bus not found');
    });
  });

  describe('remove', () => {
    test('should delete bus', async () => {
      const bus = new Bus({
        licensePlate: 'DEL-123',
        unitName: 'Delete Bus',
        status: 'parked'
      });

      const created = await busRepository.create(bus);

      await busRepository.remove(created.id);

      const found = await busRepository.findById(created.id);
      expect(found).toBeNull();
    });

    test('should throw error for non-existent bus', async () => {
      await expect(busRepository.remove('nonexistent_id')).rejects.toThrow('Bus not found');
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      // Create multiple buses
      const buses = [
        { licensePlate: 'BUS-001', unitName: 'Bus 1', status: 'moving', route: 'Route 1' },
        { licensePlate: 'BUS-002', unitName: 'Bus 2', status: 'parked', route: 'Route 1' },
        { licensePlate: 'BUS-003', unitName: 'Bus 3', status: 'moving', route: 'Route 2' },
        { licensePlate: 'BUS-004', unitName: 'Bus 4', status: 'maintenance', route: null },
        { licensePlate: 'BUS-005', unitName: 'Bus 5', status: 'parked', route: 'Route 2' }
      ];

      for (const busData of buses) {
        const bus = new Bus(busData);
        await busRepository.create(bus);
      }
    });

    test('should list all buses with default pagination', async () => {
      const result = await busRepository.list({ page: 1, pageSize: 10 });

      expect(result.buses).toHaveLength(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    test('should paginate buses correctly', async () => {
      const page1 = await busRepository.list({ page: 1, pageSize: 2 });

      expect(page1.buses).toHaveLength(2);
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);
      expect(page1.hasMore).toBe(true);

      const page2 = await busRepository.list({ page: 2, pageSize: 2 });

      expect(page2.buses).toHaveLength(2);
      expect(page2.page).toBe(2);
      expect(page2.hasMore).toBe(true);
    });

    test('should filter buses by status', async () => {
      const result = await busRepository.list({
        page: 1,
        pageSize: 10,
        filters: { status: 'moving' }
      });

      expect(result.buses).toHaveLength(2);
      result.buses.forEach(bus => {
        expect(bus.status).toBe('moving');
      });
    });

    test('should filter buses by route', async () => {
      const result = await busRepository.list({
        page: 1,
        pageSize: 10,
        filters: { route: 'Route 1' }
      });

      expect(result.buses).toHaveLength(2);
      result.buses.forEach(bus => {
        expect(bus.route).toBe('Route 1');
      });
    });

    test('should filter buses by multiple criteria', async () => {
      const result = await busRepository.list({
        page: 1,
        pageSize: 10,
        filters: {
          status: 'moving',
          route: 'Route 1'
        }
      });

      expect(result.buses).toHaveLength(1);
      expect(result.buses[0].status).toBe('moving');
      expect(result.buses[0].route).toBe('Route 1');
    });
  });
});
