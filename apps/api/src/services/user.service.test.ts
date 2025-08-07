import bcrypt from 'bcrypt';
import { RegisterUserInput, LoginUserInput } from '@sabq/validation';
import prisma from '../config/prisma';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('../config/prisma', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));
jest.mock('./auth.service');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const mockRegisterInput: RegisterUserInput = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockCreatedUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    it('should successfully register a new user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await UserService.registerUser(mockRegisterInput);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterInput.password, 10);
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterInput.email,
          password: hashedPassword,
          name: mockRegisterInput.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle bcrypt hashing failure', async () => {
      const hashError = new Error('Bcrypt hashing failed');
      mockedBcrypt.hash.mockRejectedValue(hashError);

      await expect(UserService.registerUser(mockRegisterInput)).rejects.toThrow(
        'Bcrypt hashing failed'
      );
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle database creation failure', async () => {
      const hashedPassword = 'hashedPassword123';
      const dbError = new Error('Database connection failed');
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedPrisma.user.create.mockRejectedValue(dbError);

      await expect(UserService.registerUser(mockRegisterInput)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterInput.password, 10);
    });

    it('should handle duplicate email constraint violation', async () => {
      const hashedPassword = 'hashedPassword123';
      const duplicateError = new Error('Unique constraint failed');
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedPrisma.user.create.mockRejectedValue(duplicateError);

      await expect(UserService.registerUser(mockRegisterInput)).rejects.toThrow(
        'Unique constraint failed'
      );
    });

    it('should register user with minimum valid input', async () => {
      const minimalInput: RegisterUserInput = {
        email: 'min@test.com',
        password: 'pass',
        name: 'A',
      };
      const hashedPassword = 'hashedMinPass';
      const minimalUser = {
        id: '2',
        email: 'min@test.com',
        name: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedPrisma.user.create.mockResolvedValue(minimalUser);

      const result = await UserService.registerUser(minimalInput);

      expect(result).toEqual(minimalUser);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('pass', 10);
    });

    it('should register user with special characters in name and email', async () => {
      const specialInput: RegisterUserInput = {
        email: 'test+special@example-domain.co.uk',
        password: 'P@ssw0rd!',
        name: "O'Connor-Smith",
      };
      const hashedPassword = 'hashedSpecialPass';
      const specialUser = {
        id: '3',
        email: 'test+special@example-domain.co.uk',
        name: "O'Connor-Smith",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockedPrisma.user.create.mockResolvedValue(specialUser);

      const result = await UserService.registerUser(specialInput);

      expect(result).toEqual(specialUser);
    });
  });

  describe('loginUser', () => {
    const mockLoginInput: LoginUserInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserFromDb = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'Test User',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    const mockToken = 'jwt.token.here';

    it('should successfully authenticate user with valid credentials', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedAuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.loginUser(mockLoginInput);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginInput.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginInput.password,
        mockUserFromDb.password
      );
      expect(mockedAuthService.generateToken).toHaveBeenCalledWith(mockUserFromDb);
      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: mockUserFromDb.createdAt,
          updatedAt: mockUserFromDb.updatedAt,
        },
        token: mockToken,
      });
    });

    it('should return null when user does not exist', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.loginUser(mockLoginInput);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginInput.email },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockedAuthService.generateToken).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await UserService.loginUser(mockLoginInput);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginInput.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginInput.password,
        mockUserFromDb.password
      );
      expect(mockedAuthService.generateToken).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database query failure', async () => {
      const dbError = new Error('Database connection failed');
      mockedPrisma.user.findUnique.mockRejectedValue(dbError);

      await expect(UserService.loginUser(mockLoginInput)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockedAuthService.generateToken).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison failure', async () => {
      const bcryptError = new Error('Bcrypt comparison failed');
      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockRejectedValue(bcryptError);

      await expect(UserService.loginUser(mockLoginInput)).rejects.toThrow(
        'Bcrypt comparison failed'
      );
      expect(mockedAuthService.generateToken).not.toHaveBeenCalled();
    });

    it('should handle token generation failure', async () => {
      const tokenError = new Error('Token generation failed');
      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedAuthService.generateToken.mockImplementation(() => {
        throw tokenError;
      });

      await expect(UserService.loginUser(mockLoginInput)).rejects.toThrow(
        'Token generation failed'
      );
    });

    it('should properly exclude password from returned user object', async () => {
      const userWithSensitiveData = {
        ...mockUserFromDb,
        password: 'sensitiveHashedPassword',
        socialSecurityNumber: '123-45-6789', // Additional sensitive field
      };

      mockedPrisma.user.findUnique.mockResolvedValue(userWithSensitiveData);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedAuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.loginUser(mockLoginInput);

      expect(result?.user).not.toHaveProperty('password');
      expect(result?.user).toHaveProperty('id');
      expect(result?.user).toHaveProperty('email');
      expect(result?.user).toHaveProperty('name');
    });

    it('should handle case-sensitive email lookup', async () => {
      const uppercaseEmailInput: LoginUserInput = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.loginUser(uppercaseEmailInput);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
      });
      expect(result).toBeNull();
    });

    it('should handle empty string password comparison', async () => {
      const emptyPasswordInput: LoginUserInput = {
        email: 'test@example.com',
        password: '',
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await UserService.loginUser(emptyPasswordInput);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('', mockUserFromDb.password);
      expect(result).toBeNull();
    });

    it('should handle special characters in email during login', async () => {
      const specialEmailInput: LoginUserInput = {
        email: 'test+tag@sub-domain.example.com',
        password: 'password123',
      };

      const specialUser = {
        ...mockUserFromDb,
        email: 'test+tag@sub-domain.example.com',
      };

      mockedPrisma.user.findUnique.mockResolvedValue(specialUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedAuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.loginUser(specialEmailInput);

      expect(result?.user.email).toBe('test+tag@sub-domain.example.com');
      expect(result?.token).toBe(mockToken);
    });

    it('should handle very long password comparison', async () => {
      const longPassword = 'a'.repeat(1000);
      const longPasswordInput: LoginUserInput = {
        email: 'test@example.com',
        password: longPassword,
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUserFromDb);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedAuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.loginUser(longPasswordInput);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(longPassword, mockUserFromDb.password);
      expect(result?.token).toBe(mockToken);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined input for registerUser', async () => {
      await expect(UserService.registerUser(undefined as any)).rejects.toThrow();
    });

    it('should handle undefined input for loginUser', async () => {
      await expect(UserService.loginUser(undefined as any)).rejects.toThrow();
    });

    it('should handle null input for registerUser', async () => {
      await expect(UserService.registerUser(null as any)).rejects.toThrow();
    });

    it('should handle null input for loginUser', async () => {
      await expect(UserService.loginUser(null as any)).rejects.toThrow();
    });

    it('should handle empty object input for registerUser', async () => {
      await expect(UserService.registerUser({} as any)).rejects.toThrow();
    });

    it('should handle empty object input for loginUser', async () => {
      await expect(UserService.loginUser({} as any)).rejects.toThrow();
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent registration attempts', async () => {
      const input1: RegisterUserInput = {
        email: 'user1@example.com',
        password: 'password1',
        name: 'User One',
      };
      const input2: RegisterUserInput = {
        email: 'user2@example.com',
        password: 'password2',
        name: 'User Two',
      };

      const hashedPassword1 = 'hashed1';
      const hashedPassword2 = 'hashed2';
      const user1 = { id: '1', email: 'user1@example.com', name: 'User One', createdAt: new Date(), updatedAt: new Date() };
      const user2 = { id: '2', email: 'user2@example.com', name: 'User Two', createdAt: new Date(), updatedAt: new Date() };

      mockedBcrypt.hash
        .mockResolvedValueOnce(hashedPassword1 as never)
        .mockResolvedValueOnce(hashedPassword2 as never);
      mockedPrisma.user.create
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const [result1, result2] = await Promise.all([
        UserService.registerUser(input1),
        UserService.registerUser(input2),
      ]);

      expect(result1).toEqual(user1);
      expect(result2).toEqual(user2);
    });

    it('should handle concurrent login attempts', async () => {
      const input1: LoginUserInput = { email: 'user1@example.com', password: 'pass1' };
      const input2: LoginUserInput = { email: 'user2@example.com', password: 'pass2' };

      const user1 = { id: '1', email: 'user1@example.com', password: 'hashed1', name: 'User 1', createdAt: new Date(), updatedAt: new Date() };
      const user2 = { id: '2', email: 'user2@example.com', password: 'hashed2', name: 'User 2', createdAt: new Date(), updatedAt: new Date() };

      mockedPrisma.user.findUnique
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never);
      mockedAuthService.generateToken
        .mockReturnValueOnce('token1')
        .mockReturnValueOnce('token2');

      const [result1, result2] = await Promise.all([
        UserService.loginUser(input1),
        UserService.loginUser(input2),
      ]);

      expect(result1?.token).toBe('token1');
      expect(result2?.token).toBe('token2');
    });
  });
});