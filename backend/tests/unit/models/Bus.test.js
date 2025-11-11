/**
 * Bus Model Unit Tests
 *
 * Tests Bus model validation and business logic.
 */

const Bus = require('../../../src/models/Bus');

describe('Bus Model', () => {
  describe('Constructor and Validation', () => {
    test('should create valid bus with all fields', () => {
      const busData = {
        id: 'bus123',
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'moving',
        route: 'Route 1',
        driver: 'driver123',
        movingTime: 3600,
        parkedTime: 1800,
        isFavorite: true,
        position: { lat: 13.6929, lng: -89.2182 }
      };

      const bus = new Bus(busData);

      expect(bus.id).toBe('bus123');
      expect(bus.licensePlate).toBe('ABC-123');
      expect(bus.unitName).toBe('Bus 001');
      expect(bus.status).toBe('moving');
      expect(bus.route).toBe('Route 1');
      expect(bus.driver).toBe('driver123');
      expect(bus.movingTime).toBe(3600);
      expect(bus.parkedTime).toBe(1800);
      expect(bus.isFavorite).toBe(true);
      expect(bus.position).toEqual({ lat: 13.6929, lng: -89.2182 });
    });

    test('should normalize license plate to uppercase', () => {
      const bus = new Bus({
        licensePlate: 'abc-123',
        unitName: 'Bus 001',
        status: 'parked'
      });

      expect(bus.licensePlate).toBe('ABC-123');
    });

    test('should throw error for invalid license plate length', () => {
      expect(() => {
        new Bus({
          licensePlate: 'AB',
          unitName: 'Bus 001',
          status: 'parked'
        });
      }).toThrow('License plate must be at least 3 characters');
    });

    test('should throw error for missing license plate', () => {
      expect(() => {
        new Bus({
          unitName: 'Bus 001',
          status: 'parked'
        });
      }).toThrow('License plate is required');
    });

    test('should throw error for invalid status', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001',
          status: 'invalid_status'
        });
      }).toThrow('Status must be one of: parked, moving, maintenance');
    });

    test('should throw error for missing status', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001'
        });
      }).toThrow('Status is required');
    });

    test('should throw error for missing unit name', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          status: 'parked'
        });
      }).toThrow('Unit name is required');
    });

    test('should accept null route', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'maintenance',
        route: null
      });

      expect(bus.route).toBeNull();
    });

    test('should accept null driver', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'maintenance',
        driver: null
      });

      expect(bus.driver).toBeNull();
    });

    test('should default movingTime to 0', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked'
      });

      expect(bus.movingTime).toBe(0);
    });

    test('should default parkedTime to 0', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'moving'
      });

      expect(bus.parkedTime).toBe(0);
    });

    test('should default isFavorite to false', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked'
      });

      expect(bus.isFavorite).toBe(false);
    });
  });

  describe('Position Validation', () => {
    test('should accept valid position', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'moving',
        position: { lat: 13.6929, lng: -89.2182 }
      });

      expect(bus.position).toEqual({ lat: 13.6929, lng: -89.2182 });
    });

    test('should accept null position', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked',
        position: null
      });

      expect(bus.position).toBeNull();
    });

    test('should throw error for latitude out of range (too high)', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001',
          status: 'moving',
          position: { lat: 91, lng: 0 }
        });
      }).toThrow('Latitude must be between -90 and 90');
    });

    test('should throw error for latitude out of range (too low)', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001',
          status: 'moving',
          position: { lat: -91, lng: 0 }
        });
      }).toThrow('Latitude must be between -90 and 90');
    });

    test('should throw error for longitude out of range (too high)', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001',
          status: 'moving',
          position: { lat: 0, lng: 181 }
        });
      }).toThrow('Longitude must be between -180 and 180');
    });

    test('should throw error for longitude out of range (too low)', () => {
      expect(() => {
        new Bus({
          licensePlate: 'ABC-123',
          unitName: 'Bus 001',
          status: 'moving',
          position: { lat: 0, lng: -181 }
        });
      }).toThrow('Longitude must be between -180 and 180');
    });
  });

  describe('Setters with Validation', () => {
    let bus;

    beforeEach(() => {
      bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked'
      });
    });

    test('should update license plate', () => {
      bus.licensePlate = 'XYZ-789';
      expect(bus.licensePlate).toBe('XYZ-789');
    });

    test('should throw error when setting invalid license plate', () => {
      expect(() => {
        bus.licensePlate = 'AB';
      }).toThrow('License plate must be at least 3 characters');
    });

    test('should update status', () => {
      bus.status = 'moving';
      expect(bus.status).toBe('moving');
    });

    test('should throw error when setting invalid status', () => {
      expect(() => {
        bus.status = 'invalid';
      }).toThrow('Status must be one of: parked, moving, maintenance');
    });

    test('should update position', () => {
      bus.position = { lat: 14.0, lng: -89.0 };
      expect(bus.position).toEqual({ lat: 14.0, lng: -89.0 });
    });

    test('should throw error when setting invalid position', () => {
      expect(() => {
        bus.position = { lat: 100, lng: 0 };
      }).toThrow('Latitude must be between -90 and 90');
    });

    test('should throw error for negative movingTime', () => {
      expect(() => {
        bus.movingTime = -1;
      }).toThrow('Moving time cannot be negative');
    });

    test('should throw error for negative parkedTime', () => {
      expect(() => {
        bus.parkedTime = -1;
      }).toThrow('Parked time cannot be negative');
    });
  });

  describe('Business Logic Methods', () => {
    test('toggleFavorite should change isFavorite from false to true', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked',
        isFavorite: false
      });

      bus.toggleFavorite();

      expect(bus.isFavorite).toBe(true);
    });

    test('toggleFavorite should change isFavorite from true to false', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked',
        isFavorite: true
      });

      bus.toggleFavorite();

      expect(bus.isFavorite).toBe(false);
    });

    test('toggleFavorite should work multiple times', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'parked',
        isFavorite: false
      });

      bus.toggleFavorite();
      expect(bus.isFavorite).toBe(true);

      bus.toggleFavorite();
      expect(bus.isFavorite).toBe(false);

      bus.toggleFavorite();
      expect(bus.isFavorite).toBe(true);
    });
  });

  describe('Static Methods', () => {
    test('should return correct collection name', () => {
      expect(Bus.collection()).toBe('buses');
    });
  });

  describe('toJSON Method', () => {
    test('should return all bus fields', () => {
      const bus = new Bus({
        id: 'bus123',
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'moving',
        route: 'Route 1',
        driver: 'driver123',
        movingTime: 3600,
        parkedTime: 1800,
        isFavorite: true,
        position: { lat: 13.6929, lng: -89.2182 }
      });

      const json = bus.toJSON();

      expect(json).toEqual({
        id: 'bus123',
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'moving',
        route: 'Route 1',
        driver: 'driver123',
        movingTime: 3600,
        parkedTime: 1800,
        isFavorite: true,
        position: { lat: 13.6929, lng: -89.2182 }
      });
    });

    test('should handle null values correctly', () => {
      const bus = new Bus({
        licensePlate: 'ABC-123',
        unitName: 'Bus 001',
        status: 'maintenance',
        route: null,
        driver: null,
        position: null
      });

      const json = bus.toJSON();

      expect(json.route).toBeNull();
      expect(json.driver).toBeNull();
      expect(json.position).toBeNull();
    });
  });
});
