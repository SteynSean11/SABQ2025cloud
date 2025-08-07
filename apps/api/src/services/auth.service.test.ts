import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';

// Mock jwt module
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    describe('Happy path scenarios', () => {
      it('should generate a valid JWT token for a user', () => {
        const expectedToken = 'mocked-jwt-token';
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue(expectedToken);

        const result = AuthService.generateToken(mockUser);

        expect(result).toBe(expectedToken);
        expect(mockJwt.sign).toHaveBeenCalledWith(
          { id: mockUser.id, email: mockUser.email },
          'test-secret',
          { expiresIn: '1d' }
        );
      });

      it('should include correct user payload in token', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
          expect.any(String),
          expect.any(Object)
        );
      });

      it('should set token expiration to 1 day', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          expect.objectContaining({ expiresIn: '1d' })
        );
      });
    });

    describe('Different user scenarios', () => {
      it('should handle user with different email formats', () => {
        const userWithDifferentEmail: User = {
          ...mockUser,
          email: 'user+test@sub.domain.co.uk',
        };
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(userWithDifferentEmail);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'user+test@sub.domain.co.uk',
          }),
          expect.any(String),
          expect.any(Object)
        );
      });

      it('should handle user with UUID format id', () => {
        const userWithUUID: User = {
          ...mockUser,
          id: '550e8400-e29b-41d4-a716-446655440000',
        };
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(userWithUUID);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '550e8400-e29b-41d4-a716-446655440000',
          }),
          expect.any(String),
          expect.any(Object)
        );
      });

      it('should handle user with numeric string id', () => {
        const userWithNumericId: User = {
          ...mockUser,
          id: '12345',
        };
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(userWithNumericId);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '12345',
          }),
          expect.any(String),
          expect.any(Object)
        );
      });

      it('should handle user with empty string values', () => {
        const userWithEmptyValues: User = {
          ...mockUser,
          email: '',
          id: '',
        };
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(userWithEmptyValues);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '',
            email: '',
          }),
          expect.any(String),
          expect.any(Object)
        );
      });
    });

    describe('JWT Secret scenarios', () => {
      it('should use JWT_SECRET from environment variables', () => {
        const secret = 'super-secret-key-for-testing';
        process.env.JWT_SECRET = secret;
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.any(Object),
          secret,
          expect.any(Object)
        );
      });

      it('should handle complex JWT secret with special characters', () => {
        const complexSecret = 'my-$3cr3t-k3y!@#$%^&*()_+-=[]{}|;:,.<>?';
        process.env.JWT_SECRET = complexSecret;
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.any(Object),
          complexSecret,
          expect.any(Object)
        );
      });

      it('should handle very long JWT secret', () => {
        const longSecret = 'a'.repeat(1000);
        process.env.JWT_SECRET = longSecret;
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expect.any(Object),
          longSecret,
          expect.any(Object)
        );
      });
    });

    describe('Edge cases and error scenarios', () => {
      it('should throw error when JWT_SECRET is undefined', () => {
        delete process.env.JWT_SECRET;

        expect(() => {
          AuthService.generateToken(mockUser);
        }).toThrow();
      });

      it('should throw error when JWT_SECRET is empty string', () => {
        process.env.JWT_SECRET = '';

        expect(() => {
          AuthService.generateToken(mockUser);
        }).toThrow();
      });

      it('should handle jwt.sign throwing an error', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockImplementation(() => {
          throw new Error('JWT signing failed');
        });

        expect(() => {
          AuthService.generateToken(mockUser);
        }).toThrow('JWT signing failed');
      });

      it('should handle jwt.sign returning null or undefined', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue(null as any);

        const result = AuthService.generateToken(mockUser);

        expect(result).toBeNull();
      });
    });

    describe('Token payload validation', () => {
      it('should only include id and email in token payload', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        const expectedPayload = {
          id: mockUser.id,
          email: mockUser.email,
        };

        expect(mockJwt.sign).toHaveBeenCalledWith(
          expectedPayload,
          expect.any(String),
          expect.any(Object)
        );

        // Ensure no other user properties are included
        const actualPayload = mockJwt.sign.mock.calls[0][0];
        expect(Object.keys(actualPayload)).toEqual(['id', 'email']);
      });

      it('should not include sensitive user data in payload', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        const actualPayload = mockJwt.sign.mock.calls[0][0];
        expect(actualPayload).not.toHaveProperty('password');
        expect(actualPayload).not.toHaveProperty('name');
        expect(actualPayload).not.toHaveProperty('createdAt');
        expect(actualPayload).not.toHaveProperty('updatedAt');
      });
    });

    describe('Return value validation', () => {
      it('should return the exact token generated by jwt.sign', () => {
        const expectedToken = 'mocked-jwt-token';
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue(expectedToken);

        const result = AuthService.generateToken(mockUser);

        expect(result).toBe(expectedToken);
        expect(typeof result).toBe('string');
      });

      it('should return empty string if jwt.sign returns empty string', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('');

        const result = AuthService.generateToken(mockUser);

        expect(result).toBe('');
      });
    });

    describe('Method behavior validation', () => {
      it('should be a static method', () => {
        expect(typeof AuthService.generateToken).toBe('function');
        expect(AuthService.generateToken.length).toBe(1); // Expects one parameter
      });

      it('should call jwt.sign exactly once per invocation', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockJwt.sign).toHaveBeenCalledTimes(1);
      });

      it('should not modify the input user object', () => {
        const originalUser = { ...mockUser };
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        AuthService.generateToken(mockUser);

        expect(mockUser).toEqual(originalUser);
      });
    });

    describe('Performance and consistency tests', () => {
      it('should generate consistent tokens for the same user and secret', () => {
        const fixedToken = 'consistent-token';
        process.env.JWT_SECRET = 'consistent-secret';
        mockJwt.sign.mockReturnValue(fixedToken);

        const token1 = AuthService.generateToken(mockUser);
        mockJwt.sign.mockReturnValue(fixedToken);
        const token2 = AuthService.generateToken(mockUser);

        expect(token1).toBe(token2);
      });

      it('should handle multiple rapid successive calls', () => {
        process.env.JWT_SECRET = 'test-secret';
        mockJwt.sign.mockReturnValue('token');

        const tokens = [];
        for (let i = 0; i < 100; i++) {
          tokens.push(AuthService.generateToken(mockUser));
        }

        expect(tokens).toHaveLength(100);
        expect(mockJwt.sign).toHaveBeenCalledTimes(100);
      });
    });
  });
});