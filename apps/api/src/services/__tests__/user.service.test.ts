import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import prisma from '../../config/prisma';

vi.mock('bcrypt');
vi.mock('../auth.service');
vi.mock('../../config/prisma', () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed_password_123';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      } as any);

      const result = await UserService.registerUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should register user without name (optional field)', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashed_password_123';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const result = await UserService.registerUser(userData as any);

      expect(result).toEqual(mockUser);
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed_password_123';
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockRejectedValue(prismaError);

      await expect(UserService.registerUser(userData)).rejects.toEqual(prismaError);
    });

    it('should hash password with salt rounds of 10', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed_password';

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await UserService.registerUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should handle bcrypt hashing errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const error = new Error('Hashing failed');

      vi.mocked(bcrypt.hash).mockRejectedValue(error);

      await expect(UserService.registerUser(userData)).rejects.toThrow('Hashing failed');
    });

    it('should handle database connection errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed_password';
      const error = new Error('Database connection failed');

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockRejectedValue(error);

      await expect(UserService.registerUser(userData)).rejects.toThrow('Database connection failed');
    });

    it('should handle special characters in email', async () => {
      const userData = {
        email: 'test+special@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '123',
        email: 'test+special@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const result = await UserService.registerUser(userData);

      expect(result.email).toBe('test+special@example.com');
    });

    it('should handle unicode characters in name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '测试用户',
      };
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: '测试用户',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const result = await UserService.registerUser(userData);

      expect(result.name).toBe('测试用户');
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt_token_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(AuthService.generateToken).mockReturnValue(mockToken);

      const result = await UserService.loginUser(credentials);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(AuthService.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token: mockToken,
      });
      expect(result?.user).not.toHaveProperty('password');
    });

    it('should return null when user does not exist', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await UserService.loginUser(credentials);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(AuthService.generateToken).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await UserService.loginUser(credentials);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
      expect(result).toBeNull();
      expect(AuthService.generateToken).not.toHaveBeenCalled();
    });

    it('should exclude password from returned user object', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt_token_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(AuthService.generateToken).mockReturnValue(mockToken);

      const result = await UserService.loginUser(credentials);

      expect(result?.user).not.toHaveProperty('password');
      expect(result?.user).toHaveProperty('id');
      expect(result?.user).toHaveProperty('email');
      expect(result?.user).toHaveProperty('name');
    });

    it('should handle database errors during findUnique', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Database error');

      vi.mocked(prisma.user.findUnique).mockRejectedValue(error);

      await expect(UserService.loginUser(credentials)).rejects.toThrow('Database error');
    });

    it('should handle bcrypt compare errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const error = new Error('Bcrypt error');

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockRejectedValue(error);

      await expect(UserService.loginUser(credentials)).rejects.toThrow('Bcrypt error');
    });

    it('should handle case-sensitive email matching', async () => {
      const credentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await UserService.loginUser(credentials);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
      });
      expect(result).toBeNull();
    });

    it('should generate token with correct user data', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt_token_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(AuthService.generateToken).mockReturnValue(mockToken);

      await UserService.loginUser(credentials);

      expect(AuthService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user without name field', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt_token_123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(AuthService.generateToken).mockReturnValue(mockToken);

      const result = await UserService.loginUser(credentials);

      expect(result?.user.name).toBeNull();
    });
  });
});