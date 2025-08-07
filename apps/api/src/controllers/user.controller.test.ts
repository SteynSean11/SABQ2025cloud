import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

// Mock the UserService
vi.mock('../services/user.service');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock Express request object
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
      cookies: {},
      user: undefined,
      ip: '127.0.0.1'
    };
    
    // Mock Express response object with chainable methods
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis()
    };

    // Mock UserService static methods
    mockUserService = vi.mocked(UserService);
    mockUserService.registerUser = vi.fn();
    mockUserService.loginUser = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const registeredUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date()
      };

      mockRequest.body = userData;
      mockUserService.registerUser.mockResolvedValue(registeredUser);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.registerUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: registeredUser
      });
    });

    it('should return 409 when user email already exists (Prisma P2002 error)', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const duplicateError = {
        code: 'P2002',
        meta: { target: ['email'] }
      };

      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(duplicateError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already registered'
      });
    });

    it('should handle Prisma P2002 error with email in target field', async () => {
      // Arrange
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const duplicateError = {
        code: 'P2002',
        meta: { target: ['email', 'id'] }
      };

      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(duplicateError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already registered'
      });
    });

    it('should return 500 for other Prisma P2002 errors not related to email', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const duplicateError = {
        code: 'P2002',
        meta: { target: ['username'] }
      };

      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(duplicateError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

    it('should handle generic database errors', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const databaseError = new Error('Database connection failed');
      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(databaseError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

    it('should handle validation errors from UserService', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        password: '123', // too short
        firstName: '',
        lastName: ''
      };

      const validationError = {
        name: 'ValidationError',
        message: 'Validation failed',
        issues: [
          { path: ['email'], message: 'Invalid email format' },
          { path: ['password'], message: 'Password must be at least 8 characters' }
        ]
      };

      mockRequest.body = invalidUserData;
      mockUserService.registerUser.mockRejectedValue(validationError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

    it('should log errors for debugging purposes', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const testError = new Error('Test error for logging');
      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(testError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(testError);
      consoleSpy.mockRestore();
    });

    it('should handle missing request body gracefully', async () => {
      // Arrange
      mockRequest.body = undefined;

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.registerUser).toHaveBeenCalledWith(undefined);
    });

    it('should handle empty request body', async () => {
      // Arrange
      mockRequest.body = {};

      const emptyDataError = new Error('Required fields missing');
      mockUserService.registerUser.mockRejectedValue(emptyDataError);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.registerUser).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('should successfully login user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'correctPassword'
      };

      const loginResult = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        token: 'jwt-token-here'
      };

      mockRequest.body = credentials;
      mockUserService.loginUser.mockResolvedValue(loginResult);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(credentials);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: loginResult.user,
        token: loginResult.token
      });
    });

    it('should return 401 when credentials are invalid', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      mockRequest.body = invalidCredentials;
      mockUserService.loginUser.mockResolvedValue(null);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(invalidCredentials);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 when user does not exist', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'anyPassword'
      };

      mockRequest.body = credentials;
      mockUserService.loginUser.mockResolvedValue(null);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 when UserService returns undefined', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password'
      };

      mockRequest.body = credentials;
      mockUserService.loginUser.mockResolvedValue(undefined);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 when UserService returns false', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password'
      };

      mockRequest.body = credentials;
      mockUserService.loginUser.mockResolvedValue(false);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should handle service errors with proper error response', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const serviceError = new Error('Database connection failed');
      mockRequest.body = credentials;
      mockUserService.loginUser.mockRejectedValue(serviceError);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Database connection failed'
      });
    });

    it('should handle validation errors from UserService', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid-email',
        password: ''
      };

      const validationError = {
        name: 'ValidationError',
        message: 'Invalid input data'
      };

      mockRequest.body = invalidCredentials;
      mockUserService.loginUser.mockRejectedValue(validationError);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Invalid input data'
      });
    });

    it('should handle missing request body gracefully', async () => {
      // Arrange
      mockRequest.body = undefined;
      const error = new Error('Missing credentials');
      mockUserService.loginUser.mockRejectedValue(error);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle empty request body', async () => {
      // Arrange
      mockRequest.body = {};
      const error = new Error('Email and password required');
      mockUserService.loginUser.mockRejectedValue(error);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should pass through complete request body to UserService', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
        deviceInfo: 'Mozilla/5.0'
      };

      const loginResult = {
        user: { id: '1', email: 'test@example.com' },
        token: 'token'
      };

      mockRequest.body = credentials;
      mockUserService.loginUser.mockResolvedValue(loginResult);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(credentials);
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockRequest.body = credentials;
      mockUserService.loginUser.mockRejectedValue(timeoutError);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Request timeout'
      });
    });

    it('should handle authentication service being unavailable', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const serviceUnavailableError = new Error('Authentication service unavailable');
      mockRequest.body = credentials;
      mockUserService.loginUser.mockRejectedValue(serviceUnavailableError);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Authentication service unavailable'
      });
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle null error objects in register', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(null);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

    it('should handle undefined error objects in login', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      mockRequest.body = credentials;
      mockUserService.loginUser.mockRejectedValue(undefined);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should handle errors without message property in login', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const errorWithoutMessage = { code: 'UNKNOWN_ERROR' };
      
      mockRequest.body = credentials;
      mockUserService.loginUser.mockRejectedValue(errorWithoutMessage);

      // Act
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should handle P2002 errors with missing meta property', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      const incompleteP2002Error = { code: 'P2002' };

      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(incompleteP2002Error);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

    it('should handle P2002 errors with null target', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      const p2002ErrorNullTarget = {
        code: 'P2002',
        meta: { target: null }
      };

      mockRequest.body = userData;
      mockUserService.registerUser.mockRejectedValue(p2002ErrorNullTarget);

      // Act
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle successful registration followed by login attempt', async () => {
      // This test simulates a real-world scenario where a user registers and then tries to login
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        firstName: 'New',
        lastName: 'User'
      };

      const registeredUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User'
      };

      // Registration request
      mockRequest.body = userData;
      mockUserService.registerUser.mockResolvedValue(registeredUser);

      // Act - Register
      await UserController.register(mockRequest as Request, mockResponse as Response);

      // Assert - Registration successful
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: registeredUser
      });

      // Reset mocks for login test
      vi.clearAllMocks();
      
      // Arrange - Login attempt
      const loginCredentials = {
        email: 'newuser@example.com',
        password: 'securePassword123'
      };

      const loginResult = {
        user: registeredUser,
        token: 'jwt-token'
      };

      mockRequest.body = loginCredentials;
      mockUserService.loginUser.mockResolvedValue(loginResult);

      // Act - Login
      await UserController.login(mockRequest as Request, mockResponse as Response);

      // Assert - Login successful
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: loginResult.user,
        token: loginResult.token
      });
    });
  });
});