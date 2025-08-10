/**
 * Test framework: Jest (ts-jest or babel-jest)
 * If your project uses a different framework (e.g., Vitest), adapt jest.mock and assertions accordingly.
 */

import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// We import the service under test. Adjust the relative import path if the implementation lives elsewhere.
import { UserService } from '../user.service';

// The AuthService is used for token generation; we will mock its static method.
import { AuthService } from '../auth.service';

// Stub types library if needed; if your environment resolves @sabq/validation properly, you can remove this mock.
jest.mock('@sabq/validation', () => {
  return {
    // Provide minimal shape for types; runtime not used because TS erases types, but avoiding runtime import errors.
    RegisterUserInput: {} as any,
    LoginUserInput: {} as any,
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock AuthService.generateToken
jest.mock('../auth.service', () => {
  return {
    AuthService: {
      generateToken: jest.fn(),
    },
  };
});

describe('UserService', () => {
  let prismaMock: jest.Mocked<PrismaClient>;
  let service: UserService;

  beforeEach(() => {
    // Create a minimal PrismaClient mock with only the user model functions we call
    prismaMock = {
      // @ts-ignore - partial mock for Prisma models
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    service = new UserService(prismaMock);
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('hashes the password and creates a user with selected fields (happy path)', async () => {
      const plainPassword = 'P@ssw0rd!';
      const hashedPassword = 'hashed:P@ssw0rd!';
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);

      const createdAt = new Date('2024-01-01T00:00:00Z');
      const updatedAt = new Date('2024-01-02T00:00:00Z');
      const expectedReturnedUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        createdAt,
        updatedAt,
      };

      (prismaMock.user.create as jest.Mock).mockResolvedValueOnce(expectedReturnedUser);

      const input = {
        email: 'user@example.com',
        password: plainPassword,
        name: 'Test User',
      } as any; // runtime types not needed

      const result = await service.registerUser(input);

      // bcrypt.hash called with password and salt rounds
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);

      // prisma.user.create called with hashed password and select projection
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // returns projected user (without password)
      expect(result).toEqual(expectedReturnedUser);
      expect((result as any).password).toBeUndefined();
    });

    it('propagates errors from bcrypt.hash', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('hash-failure'));

      const input = {
        email: 'user2@example.com',
        password: 'secret',
        name: 'User 2',
      } as any;

      await expect(service.registerUser(input)).rejects.toThrow('hash-failure');
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('propagates errors from prisma.user.create', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed');
      (prismaMock.user.create as jest.Mock).mockRejectedValueOnce(new Error('db-failure'));

      const input = {
        email: 'user3@example.com',
        password: 'secret',
        name: 'User 3',
      } as any;

      await expect(service.registerUser(input)).rejects.toThrow('db-failure');
    });
  });

  describe('loginUser', () => {
    it('returns null when user is not found', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const input = { email: 'missing@example.com', password: 'irrelevant' } as any;
      const result = await service.loginUser(input);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(AuthService.generateToken).not.toHaveBeenCalled();
    });

    it('returns null when password is invalid', async () => {
      const dbUser = {
        id: 'u1',
        email: 'user@example.com',
        name: 'User',
        password: 'hashed-db-password',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const input = { email: dbUser.email, password: 'wrong' } as any;
      const result = await service.loginUser(input);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', dbUser.password);
      expect(result).toBeNull();
      expect(AuthService.generateToken).not.toHaveBeenCalled();
    });

    it('returns user without password and token when credentials are valid (happy path)', async () => {
      const dbUser = {
        id: 'u2',
        email: 'valid@example.com',
        name: 'Valid User',
        password: 'hashed-db',
        createdAt: new Date('2024-02-01T00:00:00Z'),
        updatedAt: new Date('2024-02-02T00:00:00Z'),
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (AuthService.generateToken as jest.Mock).mockReturnValueOnce('jwt-token-123');

      const input = { email: dbUser.email, password: 'correct' } as any;
      const result = await service.loginUser(input);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dbUser.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('correct', dbUser.password);
      expect(AuthService.generateToken).toHaveBeenCalledWith(dbUser);

      // Ensure password omitted from returned user object
      expect(result).not.toBeNull();
      expect(result!.token).toBe('jwt-token-123');

      // @ts-ignore
      expect(result!.user).toEqual({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      });
      // @ts-ignore
      expect((result!.user as any).password).toBeUndefined();
    });

    it('propagates errors thrown by prisma.user.findUnique', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('db-find-error'));
      const input = { email: 'any@example.com', password: 'x' } as any;

      await expect(service.loginUser(input)).rejects.toThrow('db-find-error');
    });

    it('propagates errors thrown by bcrypt.compare', async () => {
      const dbUser = {
        id: 'u3',
        email: 'err@example.com',
        name: 'Err User',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(dbUser);
      (bcrypt.compare as jest.Mock).mockRejectedValueOnce(new Error('compare-failed'));

      const input = { email: dbUser.email, password: 'whatever' } as any;

      await expect(service.loginUser(input)).rejects.toThrow('compare-failed');
      expect(AuthService.generateToken).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by AuthService.generateToken', async () => {
      const dbUser = {
        id: 'u4',
        email: 'tokenfail@example.com',
        name: 'Token Fail',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (AuthService.generateToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error('token-gen-failure');
      });

      const input = { email: dbUser.email, password: 'ok' } as any;

      await expect(service.loginUser(input)).rejects.toThrow('token-gen-failure');
    });
  });
});