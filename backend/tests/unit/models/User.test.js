/**
 * User Model Unit Tests
 *
 * Tests User model validation and business logic.
 */

const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('Constructor and Validation', () => {
    test('should create valid user with all fields', () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = new User(userData);

      expect(user.id).toBe('user123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('admin');
      expect(user.passwordHash).toBe('hashed_password');
    });

    test('should create user without id (for new users)', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'supervisor',
        passwordHash: 'hashed_password'
      };

      const user = new User(userData);

      expect(user.id).toBeUndefined();
      expect(user.email).toBe('test@example.com');
    });

    test('should normalize email to lowercase', () => {
      const user = new User({
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed'
      });

      expect(user.email).toBe('test@example.com');
    });

    test('should throw error for invalid email format', () => {
      expect(() => {
        new User({
          email: 'invalid-email',
          name: 'Test User',
          role: 'admin',
          passwordHash: 'hashed'
        });
      }).toThrow('Invalid email format');
    });

    test('should throw error for missing email', () => {
      expect(() => {
        new User({
          name: 'Test User',
          role: 'admin',
          passwordHash: 'hashed'
        });
      }).toThrow('Email is required');
    });

    test('should throw error for invalid role', () => {
      expect(() => {
        new User({
          email: 'test@example.com',
          name: 'Test User',
          role: 'invalid_role',
          passwordHash: 'hashed'
        });
      }).toThrow('Role must be either admin or supervisor');
    });

    test('should throw error for missing name', () => {
      expect(() => {
        new User({
          email: 'test@example.com',
          role: 'admin',
          passwordHash: 'hashed'
        });
      }).toThrow('Name is required');
    });

    test('should throw error for name too short', () => {
      expect(() => {
        new User({
          email: 'test@example.com',
          name: 'A',
          role: 'admin',
          passwordHash: 'hashed'
        });
      }).toThrow('Name must be at least 2 characters');
    });
  });

  describe('Setters with Validation', () => {
    let user;

    beforeEach(() => {
      user = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed'
      });
    });

    test('should update email with valid format', () => {
      user.email = 'newemail@example.com';
      expect(user.email).toBe('newemail@example.com');
    });

    test('should throw error when setting invalid email', () => {
      expect(() => {
        user.email = 'invalid-email';
      }).toThrow('Invalid email format');
    });

    test('should update name with valid length', () => {
      user.name = 'New Name';
      expect(user.name).toBe('New Name');
    });

    test('should throw error when setting name too short', () => {
      expect(() => {
        user.name = 'A';
      }).toThrow('Name must be at least 2 characters');
    });

    test('should update role with valid value', () => {
      user.role = 'supervisor';
      expect(user.role).toBe('supervisor');
    });

    test('should throw error when setting invalid role', () => {
      expect(() => {
        user.role = 'invalid_role';
      }).toThrow('Role must be either admin or supervisor');
    });

    test('should update passwordHash', () => {
      user.passwordHash = 'new_hashed_password';
      expect(user.passwordHash).toBe('new_hashed_password');
    });
  });

  describe('Static Methods', () => {
    test('should return correct collection name', () => {
      expect(User.collection()).toBe('users');
    });
  });

  describe('toJSON Method', () => {
    test('should return user without passwordHash', () => {
      const user = new User({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed_password',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      });

      const json = user.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('role');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
      expect(json).not.toHaveProperty('passwordHash');
    });

    test('should include all public fields', () => {
      const user = new User({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'supervisor',
        passwordHash: 'hashed'
      });

      const json = user.toJSON();

      expect(json.id).toBe('user123');
      expect(json.email).toBe('test@example.com');
      expect(json.name).toBe('Test User');
      expect(json.role).toBe('supervisor');
    });
  });
});
