/**
 * UserRepository Integration Tests
 *
 * Tests UserRepository against Firestore Emulator.
 * 
 * Prerequisites:
 * - Firestore Emulator must be running
 * - Start with: firebase emulators:start --only firestore
 */

const { initializeTestFirebase, clearCollection } = require('./setup');
const { FirestoreUserRepository } = require('../../../src/services/userRepository');
const User = require('../../../src/models/User');

describe('UserRepository Integration Tests', () => {
  let db;
  let userRepository;

  beforeAll(() => {
    const { db: testDb } = initializeTestFirebase();
    db = testDb;
    userRepository = new FirestoreUserRepository(db);
  });

  beforeEach(async () => {
    // Clean users collection before each test
    await clearCollection(db, 'users');
  });

  afterAll(async () => {
    // Clean up after all tests
    await clearCollection(db, 'users');
  });

  describe('create', () => {
    test('should create a new user', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed_password'
      });

      const created = await userRepository.create(user);

      expect(created).toBeInstanceOf(User);
      expect(created.id).toBeDefined();
      expect(created.email).toBe('test@example.com');
      expect(created.name).toBe('Test User');
      expect(created.role).toBe('admin');
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    test('should throw error for duplicate email', async () => {
      const user1 = new User({
        email: 'duplicate@example.com',
        name: 'User 1',
        role: 'admin',
        passwordHash: 'hashed'
      });

      await userRepository.create(user1);

      const user2 = new User({
        email: 'duplicate@example.com',
        name: 'User 2',
        role: 'supervisor',
        passwordHash: 'hashed'
      });

      await expect(userRepository.create(user2)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const user = new User({
        email: 'find@example.com',
        name: 'Find User',
        role: 'supervisor',
        passwordHash: 'hashed'
      });

      await userRepository.create(user);

      const found = await userRepository.findByEmail('find@example.com');

      expect(found).toBeInstanceOf(User);
      expect(found.email).toBe('find@example.com');
      expect(found.name).toBe('Find User');
    });

    test('should return null for non-existent email', async () => {
      const found = await userRepository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });

    test('should be case-insensitive', async () => {
      const user = new User({
        email: 'case@example.com',
        name: 'Case User',
        role: 'admin',
        passwordHash: 'hashed'
      });

      await userRepository.create(user);

      const found = await userRepository.findByEmail('CASE@EXAMPLE.COM');

      expect(found).toBeInstanceOf(User);
      expect(found.email).toBe('case@example.com');
    });
  });

  describe('findById', () => {
    test('should find user by id', async () => {
      const user = new User({
        email: 'findid@example.com',
        name: 'Find ID User',
        role: 'admin',
        passwordHash: 'hashed'
      });

      const created = await userRepository.create(user);

      const found = await userRepository.findById(created.id);

      expect(found).toBeInstanceOf(User);
      expect(found.id).toBe(created.id);
      expect(found.email).toBe('findid@example.com');
    });

    test('should return null for non-existent id', async () => {
      const found = await userRepository.findById('nonexistent_id');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    test('should update user fields', async () => {
      const user = new User({
        email: 'update@example.com',
        name: 'Original Name',
        role: 'supervisor',
        passwordHash: 'hashed'
      });

      const created = await userRepository.create(user);

      // Update user
      created.name = 'Updated Name';
      created.role = 'admin';

      const updated = await userRepository.update(created);

      expect(updated.name).toBe('Updated Name');
      expect(updated.role).toBe('admin');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.createdAt.getTime());
    });

    test('should throw error for non-existent user', async () => {
      const user = new User({
        id: 'nonexistent_id',
        email: 'test@example.com',
        name: 'Test',
        role: 'admin',
        passwordHash: 'hashed'
      });

      await expect(userRepository.update(user)).rejects.toThrow('User not found');
    });
  });

  describe('remove', () => {
    test('should delete user', async () => {
      const user = new User({
        email: 'delete@example.com',
        name: 'Delete User',
        role: 'supervisor',
        passwordHash: 'hashed'
      });

      const created = await userRepository.create(user);

      await userRepository.remove(created.id);

      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    test('should throw error for non-existent user', async () => {
      await expect(userRepository.remove('nonexistent_id')).rejects.toThrow('User not found');
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      // Create multiple users
      const users = [
        { email: 'user1@example.com', name: 'User 1', role: 'admin' },
        { email: 'user2@example.com', name: 'User 2', role: 'supervisor' },
        { email: 'user3@example.com', name: 'User 3', role: 'admin' },
        { email: 'user4@example.com', name: 'User 4', role: 'supervisor' },
        { email: 'user5@example.com', name: 'User 5', role: 'admin' }
      ];

      for (const userData of users) {
        const user = new User({
          ...userData,
          passwordHash: 'hashed'
        });
        await userRepository.create(user);
      }
    });

    test('should list all users with default pagination', async () => {
      const result = await userRepository.list({ page: 1, pageSize: 10 });

      expect(result.users).toHaveLength(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    test('should paginate users correctly', async () => {
      const page1 = await userRepository.list({ page: 1, pageSize: 2 });

      expect(page1.users).toHaveLength(2);
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);
      expect(page1.hasMore).toBe(true);

      const page2 = await userRepository.list({ page: 2, pageSize: 2 });

      expect(page2.users).toHaveLength(2);
      expect(page2.page).toBe(2);
      expect(page2.hasMore).toBe(true);
    });

    test('should filter users by role', async () => {
      const result = await userRepository.list({
        page: 1,
        pageSize: 10,
        filters: { role: 'admin' }
      });

      expect(result.users).toHaveLength(3);
      result.users.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });
  });
});
