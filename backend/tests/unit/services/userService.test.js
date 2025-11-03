/**
 * UserService Unit Tests
 *
 * Tests user authentication and registration logic.
 */

const bcrypt = require('bcrypt');
const userService = require('../../../src/services/userService');
const { userRepository } = require('../../../src/services/userRepository');
const { jwtUtil } = require('../../../src/utils/jwt');

// Mock dependencies
jest.mock('../../../src/services/userRepository');
jest.mock('../../../src/utils/jwt');
jest.mock('bcrypt');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'MyP@ssw0rd123',
        role: 'admin'
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        toJSON: jest.fn().mockReturnValue({
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        })
      };

      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockUser);
      jwtUtil.generateAccessToken.mockReturnValue('access_token');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh_token');

      const result = await userService.register(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('MyP@ssw0rd123', expect.any(Number));
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
    });

    test('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'MyP@ssw0rd123',
        role: 'admin'
      };

      userRepository.findByEmail.mockResolvedValue({ id: 'existing_user' });

      await expect(userService.register(userData)).rejects.toThrow('Email already in use');
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    test('should throw error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'MyP@ssw0rd123',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Invalid email format');
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    test('should throw error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must contain at least');
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    test('should throw error for password without uppercase', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'myp@ssw0rd123',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must contain at least');
    });

    test('should throw error for password without lowercase', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'MYP@SSW0RD123',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must contain at least');
    });

    test('should throw error for password without digit', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'MyP@ssword',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must contain at least');
    });

    test('should throw error for password without special character', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'MyPassword123',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must contain at least');
    });

    test('should throw error for password too short', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'MyP@s1',
        role: 'admin'
      };

      await expect(userService.register(userData)).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should normalize email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
        password: 'MyP@ssw0rd123',
        role: 'admin'
      };

      const mockUser = {
        toJSON: jest.fn().mockReturnValue({ id: 'user123' })
      };

      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      userRepository.create.mockResolvedValue(mockUser);
      jwtUtil.generateAccessToken.mockReturnValue('token');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh');

      await userService.register(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    test('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'MyP@ssw0rd123'
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        passwordHash: 'hashed_password',
        toJSON: jest.fn().mockReturnValue({
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        })
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwtUtil.generateAccessToken.mockReturnValue('access_token');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh_token');

      const result = await userService.login(credentials);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('MyP@ssw0rd123', 'hashed_password');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
    });

    test('should throw error for non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'MyP@ssw0rd123'
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login(credentials)).rejects.toThrow('Invalid email or password');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('should throw error for incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const mockUser = {
        passwordHash: 'hashed_password'
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.login(credentials)).rejects.toThrow('Invalid email or password');
    });

    test('should normalize email to lowercase during login', async () => {
      const credentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'MyP@ssw0rd123'
      };

      const mockUser = {
        passwordHash: 'hashed',
        toJSON: jest.fn().mockReturnValue({})
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwtUtil.generateAccessToken.mockReturnValue('token');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh');

      await userService.login(credentials);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('refreshToken', () => {
    test('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const decoded = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      jwtUtil.verifyRefresh.mockReturnValue(decoded);
      jwtUtil.generateAccessToken.mockReturnValue('new_access_token');
      jwtUtil.generateRefreshToken.mockReturnValue('new_refresh_token');

      const result = await userService.refreshToken(refreshToken);

      expect(jwtUtil.verifyRefresh).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({
        token: 'new_access_token',
        refreshToken: 'new_refresh_token'
      });
    });

    test('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid_token';

      jwtUtil.verifyRefresh.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(userService.refreshToken(refreshToken)).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    test('should return user by id', async () => {
      const userId = 'user123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        toJSON: jest.fn().mockReturnValue({
          id: userId,
          email: 'test@example.com'
        })
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('id', userId);
    });

    test('should throw 404 error if user not found', async () => {
      const userId = 'nonexistent';

      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toMatchObject({
        status: 404,
        message: 'User not found'
      });
    });
  });

  describe('getUserByEmail', () => {
    test('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user123',
        email,
        toJSON: jest.fn().mockReturnValue({
          id: 'user123',
          email
        })
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toHaveProperty('email', email);
    });

    test('should throw 404 error if user not found', async () => {
      const email = 'nonexistent@example.com';

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.getUserByEmail(email)).rejects.toMatchObject({
        status: 404,
        message: 'User not found'
      });
    });
  });
});
