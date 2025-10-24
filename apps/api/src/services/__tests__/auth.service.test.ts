import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

vi.mock('jsonwebtoken');

describe('AuthService', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    vi.restoreAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const mockToken = 'jwt_token_123';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      const token = AuthService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        'test-secret-key',
        { expiresIn: '1d' }
      );
      expect(token).toBe(mockToken);
    });

    it('should include user id and email in payload', () => {
      const mockToken = 'jwt_token_123';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload).toHaveProperty('id', '123');
      expect(payload).toHaveProperty('email', 'test@example.com');
      expect(payload).not.toHaveProperty('password');
      expect(payload).not.toHaveProperty('name');
    });

    it('should set expiration to 1 day', () => {
      const mockToken = 'jwt_token_123';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const options = callArgs[2] as any;

      expect(options).toHaveProperty('expiresIn', '1d');
    });

    it('should use JWT_SECRET from environment', () => {
      const mockToken = 'jwt_token_123';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const secret = callArgs[1];

      expect(secret).toBe('test-secret-key');
    });

    it('should handle users with different IDs', () => {
      const user1: User = { ...mockUser, id: 'user-1' };
      const user2: User = { ...mockUser, id: 'user-2' };
      const mockToken1 = 'token_1';
      const mockToken2 = 'token_2';

      vi.mocked(jwt.sign)
        .mockReturnValueOnce(mockToken1 as any)
        .mockReturnValueOnce(mockToken2 as any);

      const token1 = AuthService.generateToken(user1);
      const token2 = AuthService.generateToken(user2);

      expect(token1).toBe(mockToken1);
      expect(token2).toBe(mockToken2);
    });

    it('should handle users with different emails', () => {
      const user1: User = { ...mockUser, email: 'user1@example.com' };
      const user2: User = { ...mockUser, email: 'user2@example.com' };

      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(user1);
      const call1Args = vi.mocked(jwt.sign).mock.calls[0][0] as any;

      AuthService.generateToken(user2);
      const call2Args = vi.mocked(jwt.sign).mock.calls[1][0] as any;

      expect(call1Args.email).toBe('user1@example.com');
      expect(call2Args.email).toBe('user2@example.com');
    });

    it('should not include password in token payload', () => {
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload).not.toHaveProperty('password');
    });

    it('should not include name in token payload', () => {
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload).not.toHaveProperty('name');
    });

    it('should not include timestamps in token payload', () => {
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(mockUser);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload).not.toHaveProperty('createdAt');
      expect(payload).not.toHaveProperty('updatedAt');
    });

    it('should handle user with null name', () => {
      const userWithoutName: User = { ...mockUser, name: null };
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      const token = AuthService.generateToken(userWithoutName);

      expect(token).toBe('token');
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should handle special characters in email', () => {
      const userWithSpecialEmail: User = {
        ...mockUser,
        email: 'test+special@example.com',
      };
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(userWithSpecialEmail);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload.email).toBe('test+special@example.com');
    });

    it('should handle UUID format IDs', () => {
      const userWithUUID: User = {
        ...mockUser,
        id: '550e8400-e29b-41d4-a716-446655440000',
      };
      vi.mocked(jwt.sign).mockReturnValue('token' as any);

      AuthService.generateToken(userWithUUID);

      const callArgs = vi.mocked(jwt.sign).mock.calls[0];
      const payload = callArgs[0] as any;

      expect(payload.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return the token as a string', () => {
      const mockToken = 'jwt_token_123';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      const token = AuthService.generateToken(mockUser);

      expect(typeof token).toBe('string');
      expect(token).toBe(mockToken);
    });
  });
});