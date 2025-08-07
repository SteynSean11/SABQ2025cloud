import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

// Mock jwt module
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      role: 'USER',
      profilePicture: null
    };

    it('should generate a valid JWT token for a user', () => {
      // Arrange
      const expectedToken = 'mocked-jwt-token';
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue(expectedToken as any);

      // Act
      const result = AuthService.generateToken(mockUser);

      // Assert
      expect(result).toBe(expectedToken);
      expect(mockSign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should include correct payload in the token', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      const [payload] = mockSign.mock.calls[0];
      expect(payload).toEqual({
        id: mockUser.id,
        email: mockUser.email
      });
    });

    it('should use JWT_SECRET from environment variables', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      const [, secret] = mockSign.mock.calls[0];
      expect(secret).toBe('test-secret-key');
    });

    it('should set token expiration to 1 day', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      const [, , options] = mockSign.mock.calls[0];
      expect(options).toEqual({ expiresIn: '1d' });
    });

    it('should handle users with different IDs and emails', () => {
      // Arrange
      const differentUser: User = {
        ...mockUser,
        id: 'different-user-456',
        email: 'different@example.com'
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('different-token' as any);

      // Act
      const result = AuthService.generateToken(differentUser);

      // Assert
      expect(result).toBe('different-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: 'different-user-456', email: 'different@example.com' },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should handle users with null values gracefully', () => {
      // Arrange
      const userWithNulls: User = {
        ...mockUser,
        firstName: null,
        lastName: null,
        profilePicture: null,
        lastLoginAt: null
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('token-with-nulls' as any);

      // Act
      const result = AuthService.generateToken(userWithNulls);

      // Assert
      expect(result).toBe('token-with-nulls');
      expect(mockSign).toHaveBeenCalledWith(
        { id: userWithNulls.id, email: userWithNulls.email },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockImplementation(() => {
        throw new Error('secretOrPrivateKey must be a string or buffer');
      });

      // Act & Assert
      expect(() => AuthService.generateToken(mockUser)).toThrow('secretOrPrivateKey must be a string or buffer');
    });

    it('should handle JWT signing errors', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      const jwtError = new Error('JWT signing failed');
      mockSign.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => AuthService.generateToken(mockUser)).toThrow('JWT signing failed');
    });

    it('should work with empty string JWT_SECRET', () => {
      // Arrange
      process.env.JWT_SECRET = '';
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockImplementation(() => {
        throw new Error('secretOrPrivateKey must be a string or buffer');
      });

      // Act & Assert
      expect(() => AuthService.generateToken(mockUser)).toThrow('secretOrPrivateKey must be a string or buffer');
    });

    it('should handle special characters in user email', () => {
      // Arrange
      const specialUser: User = {
        ...mockUser,
        email: 'test+special@sub-domain.example.co.uk'
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('special-token' as any);

      // Act
      const result = AuthService.generateToken(specialUser);

      // Assert
      expect(result).toBe('special-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: specialUser.id, email: 'test+special@sub-domain.example.co.uk' },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should handle very long user IDs and emails', () => {
      // Arrange
      const longId = 'a'.repeat(1000);
      const longEmail = 'very-long-email-' + 'a'.repeat(100) + '@example.com';
      const longUser: User = {
        ...mockUser,
        id: longId,
        email: longEmail
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('long-token' as any);

      // Act
      const result = AuthService.generateToken(longUser);

      // Assert
      expect(result).toBe('long-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: longId, email: longEmail },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });
  });

  describe('Security and Edge Cases', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      role: 'USER',
      profilePicture: null
    };

    it('should handle concurrent token generation requests', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('concurrent-token' as any);

      // Act - Generate multiple tokens concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(AuthService.generateToken({
          ...mockUser,
          id: `user-${i}`
        }))
      );

      return Promise.all(promises).then(tokens => {
        // Assert
        expect(tokens).toHaveLength(10);
        tokens.forEach(token => {
          expect(token).toBe('concurrent-token');
        });
        expect(mockSign).toHaveBeenCalledTimes(10);
      });
    });

    it('should handle malformed user objects gracefully', () => {
      // Arrange
      const malformedUser = {
        id: 'user-123',
        email: 'test@example.com'
      } as User;
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('malformed-token' as any);

      // Act
      const result = AuthService.generateToken(malformedUser);

      // Assert
      expect(result).toBe('malformed-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: 'user-123', email: 'test@example.com' },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should not include sensitive user data in token payload', () => {
      // Arrange
      const sensitiveUser: User = {
        ...mockUser,
        password: 'super-secret-password'
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('safe-token' as any);

      // Act
      AuthService.generateToken(sensitiveUser);

      // Assert
      const [payload] = mockSign.mock.calls[0];
      expect(payload).not.toHaveProperty('password');
      expect(payload).not.toHaveProperty('firstName');
      expect(payload).not.toHaveProperty('lastName');
      expect(payload).not.toHaveProperty('createdAt');
      expect(payload).toEqual({
        id: sensitiveUser.id,
        email: sensitiveUser.email
      });
    });

    it('should handle XSS attempts in user email', () => {
      // Arrange
      const xssUser: User = {
        ...mockUser,
        email: '<script>alert("xss")</script>@example.com'
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('xss-token' as any);

      // Act
      const result = AuthService.generateToken(xssUser);

      // Assert
      expect(result).toBe('xss-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: xssUser.id, email: '<script>alert("xss")</script>@example.com' },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should handle SQL injection attempts in user data', () => {
      // Arrange
      const sqlInjectionUser: User = {
        ...mockUser,
        id: "'; DROP TABLE users; --",
        email: "test'; DROP TABLE sessions; --@example.com"
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('sql-token' as any);

      // Act
      const result = AuthService.generateToken(sqlInjectionUser);

      // Assert
      expect(result).toBe('sql-token');
      expect(mockSign).toHaveBeenCalledWith(
        { 
          id: "'; DROP TABLE users; --", 
          email: "test'; DROP TABLE sessions; --@example.com" 
        },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });

    it('should work with different JWT_SECRET formats', () => {
      // Arrange
      process.env.JWT_SECRET = 'complex-secret!@#$%^&*()_+-=[]{}|;:,.<>?';
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('complex-secret-token' as any);

      // Act
      const result = AuthService.generateToken(mockUser);

      // Assert
      expect(result).toBe('complex-secret-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        'complex-secret!@#$%^&*()_+-=[]{}|;:,.<>?',
        { expiresIn: '1d' }
      );
    });

    it('should handle unicode characters in user data', () => {
      // Arrange
      const unicodeUser: User = {
        ...mockUser,
        id: 'user-åæø-123',
        email: 'test-üñíçødé@éxample.com'
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('unicode-token' as any);

      // Act
      const result = AuthService.generateToken(unicodeUser);

      // Assert
      expect(result).toBe('unicode-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: 'user-åæø-123', email: 'test-üñíçødé@éxample.com' },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });
  });

  describe('Method behavior and static nature', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      role: 'USER',
      profilePicture: null
    };

    it('should be callable as a static method', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('static-token' as any);

      // Act
      const result = AuthService.generateToken(mockUser);

      // Assert
      expect(result).toBe('static-token');
      expect(typeof AuthService.generateToken).toBe('function');
    });

    it('should not require instantiation', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('no-instance-token' as any);

      // Act - Call directly on class without instantiation
      const result = AuthService.generateToken(mockUser);

      // Assert
      expect(result).toBe('no-instance-token');
    });

    it('should be pure function (same input produces same output)', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('pure-token' as any);

      // Act
      const result1 = AuthService.generateToken(mockUser);
      const result2 = AuthService.generateToken(mockUser);

      // Assert
      expect(result1).toBe('pure-token');
      expect(result2).toBe('pure-token');
      expect(mockSign).toHaveBeenCalledTimes(2);
      expect(mockSign.mock.calls[0]).toEqual(mockSign.mock.calls[1]);
    });

    it('should handle undefined user properties', () => {
      // Arrange
      const userWithUndefined: User = {
        ...mockUser,
        firstName: undefined as any,
        lastName: undefined as any
      };
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('undefined-token' as any);

      // Act
      const result = AuthService.generateToken(userWithUndefined);

      // Assert
      expect(result).toBe('undefined-token');
      expect(mockSign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });
  });

  describe('JWT library integration', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      role: 'USER',
      profilePicture: null
    };

    it('should call jwt.sign exactly once per token generation', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('single-call-token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      expect(mockSign).toHaveBeenCalledTimes(1);
    });

    it('should pass correct arguments to jwt.sign', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('correct-args-token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      expect(mockSign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle jwt.sign returning different types', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      
      // Test with different return types that jwt.sign might return
      const testCases = [
        'string-token',
        123 as any, // jwt.sign can return different types based on implementation
        { token: 'object-token' } as any
      ];

      testCases.forEach((returnValue, index) => {
        mockSign.mockReturnValue(returnValue);
        
        // Act
        const result = AuthService.generateToken({
          ...mockUser,
          id: `user-${index}`
        });

        // Assert
        expect(result).toBe(returnValue);
      });
    });

    it('should preserve jwt.sign behavior with various options', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('options-token' as any);

      // Act
      AuthService.generateToken(mockUser);

      // Assert
      const [, , options] = mockSign.mock.calls[0];
      expect(options).toBeDefined();
      expect(options.expiresIn).toBe('1d');
    });
  });

  describe('Error handling and robustness', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      role: 'USER',
      profilePicture: null
    };

    it('should propagate jwt.sign errors', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      const customError = new Error('Custom JWT error');
      mockSign.mockImplementation(() => {
        throw customError;
      });

      // Act & Assert
      expect(() => AuthService.generateToken(mockUser)).toThrow('Custom JWT error');
    });

    it('should handle various jwt.sign error types', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      
      const errorTests = [
        new Error('Generic error'),
        new TypeError('Type error'),
        new RangeError('Range error'),
        'String error' as any
      ];

      errorTests.forEach((error, index) => {
        mockSign.mockImplementation(() => {
          throw error;
        });

        // Act & Assert
        expect(() => AuthService.generateToken({
          ...mockUser,
          id: `error-user-${index}`
        })).toThrow();
      });
    });

    it('should work correctly when called multiple times with different users', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      const users = Array.from({ length: 5 }, (_, i) => ({
        ...mockUser,
        id: `user-${i}`,
        email: `user${i}@example.com`
      }));

      // Act
      const tokens = users.map((user, i) => {
        mockSign.mockReturnValue(`token-${i}` as any);
        return AuthService.generateToken(user);
      });

      // Assert
      expect(tokens).toHaveLength(5);
      tokens.forEach((token, i) => {
        expect(token).toBe(`token-${i}`);
      });
      expect(mockSign).toHaveBeenCalledTimes(5);
    });

    it('should handle memory pressure scenarios', () => {
      // Arrange
      const mockSign = vi.mocked(jwt.sign);
      mockSign.mockReturnValue('memory-pressure-token' as any);

      // Act - Simulate high memory usage scenario
      const largeUser: User = {
        ...mockUser,
        id: 'x'.repeat(100000), // Very large ID
        email: 'large-email-' + 'y'.repeat(10000) + '@example.com'
      };

      const result = AuthService.generateToken(largeUser);

      // Assert
      expect(result).toBe('memory-pressure-token');
      expect(mockSign).toHaveBeenCalledWith(
        { 
          id: largeUser.id, 
          email: largeUser.email 
        },
        'test-secret-key',
        { expiresIn: '1d' }
      );
    });
  });
});