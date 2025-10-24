import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { UserController } from '../user.controller';
import { UserService } from '../../services/user.service';

vi.mock('../../services/user.service');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = userData;
      vi.mocked(UserService.registerUser).mockResolvedValue(mockUser);

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(UserService.registerUser).toHaveBeenCalledWith(userData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: mockUser,
      });
    });

    it('should return 409 when email already exists (P2002 error)', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockRequest.body = userData;
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed',
      };
      vi.mocked(UserService.registerUser).mockRejectedValue(prismaError);

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Email already registered',
      });
    });

    it('should handle generic errors with 500 status', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockRequest.body = userData;
      vi.mocked(UserService.registerUser).mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = { email: 'test@example.com' };
      vi.mocked(UserService.registerUser).mockRejectedValue(new Error('Validation error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty request body', async () => {
      mockRequest.body = {};
      vi.mocked(UserService.registerUser).mockRejectedValue(new Error('Invalid input'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'jwt-token-123',
      };

      mockRequest.body = credentials;
      vi.mocked(UserService.loginUser).mockResolvedValue(mockResult);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(UserService.loginUser).toHaveBeenCalledWith(credentials);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login successful',
        user: mockResult.user,
        token: mockResult.token,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockRequest.body = credentials;
      vi.mocked(UserService.loginUser).mockResolvedValue(null);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should return 401 when user does not exist', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockRequest.body = credentials;
      vi.mocked(UserService.loginUser).mockResolvedValue(null);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should handle service errors with 500 status', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Database connection failed');

      mockRequest.body = credentials;
      vi.mocked(UserService.loginUser).mockRejectedValue(error);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: error.message,
      });
    });

    it('should handle empty credentials', async () => {
      mockRequest.body = {};
      vi.mocked(UserService.loginUser).mockResolvedValue(null);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('should handle malformed request body', async () => {
      mockRequest.body = { email: 'test@example.com' };
      vi.mocked(UserService.loginUser).mockResolvedValue(null);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(UserService.loginUser).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('should handle null error messages gracefully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error: any = { message: undefined };

      mockRequest.body = credentials;
      vi.mocked(UserService.loginUser).mockRejectedValue(error);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: undefined,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long email addresses', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const userData = {
        email: longEmail,
        password: 'password123',
        name: 'Test User',
      };

      mockRequest.body = userData;
      vi.mocked(UserService.registerUser).mockRejectedValue(new Error('Email too long'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });

    it('should handle special characters in input', async () => {
      const userData = {
        email: 'test+special@example.com',
        password: 'p@$$w0rd!#',
        name: 'Test O\'Brien',
      };
      const mockUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = userData;
      vi.mocked(UserService.registerUser).mockResolvedValue(mockUser);

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: mockUser,
      });
    });

    it('should handle unicode characters in name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户 🎉',
      };
      const mockUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = userData;
      vi.mocked(UserService.registerUser).mockResolvedValue(mockUser);

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });
});