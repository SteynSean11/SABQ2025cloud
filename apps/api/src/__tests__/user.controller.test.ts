/**
 * Tests for UserController register and login methods.
 *
 * Testing framework: Jest (TypeScript), with typical Express req/res mocking.
 * If the project uses ts-jest, this file should run with jest. If Vitest is used,
 * replace jest.fn/jest.mock with vi.fn/vi.mock accordingly.
 */

import type { Request, Response } from 'express';

// IMPORTANT: We mock UserService before importing the controller so the module-level
// instantiation uses the mocked class.
const registerUserMock = jest.fn();
const loginUserMock = jest.fn();

jest.mock('../services/user.service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        registerUser: registerUserMock,
        loginUser: loginUserMock,
      };
    }),
  };
});

// Mock prisma import to avoid any real DB usage.
jest.mock('../config/prisma', () => {
  return {
    __esModule: true,
    default: {} as any,
  };
});

// Now import the controller under test
import { UserController } from '../user.controller';

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

function createMockRes() {
  const res: Partial<Response> & {
    status: jest.Mock;
    json: jest.Mock;
  } = {
    status: jest.fn(),
    json: jest.fn(),
  };
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully and return 201 with payload', async () => {
      const req = {
        body: {
          name: 'Alice',
          email: 'alice@example.com',
          password: 'SecureP@ssw0rd',
        },
      } as unknown as Request;

      const res = createMockRes();

      const fakeUser = {
        id: 'u_123',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      registerUserMock.mockResolvedValueOnce(fakeUser);

      await UserController.register(req, res);

      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(registerUserMock).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: fakeUser,
      });
    });

    it('should return 409 if email is already registered (Prisma P2002 on email)', async () => {
      const req = {
        body: {
          name: 'Bob',
          email: 'bob@example.com',
          password: 'password123',
        },
      } as unknown as Request;
      const res = createMockRes();

      const prismaUniqueError = {
        code: 'P2002',
        meta: {
          target: ['email'],
        },
      };

      registerUserMock.mockRejectedValueOnce(prismaUniqueError);

      await UserController.register(req, res);

      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already registered',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      const req = {
        body: {
          name: 'Carol',
          email: 'carol@example.com',
          password: 'password123',
        },
      } as unknown as Request;
      const res = createMockRes();

      const unexpected = new Error('Something went wrong');
      registerUserMock.mockRejectedValueOnce(unexpected);

      // Spy on console.error to avoid noisy output and to verify logging
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(req, res);

      expect(registerUserMock).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      errorSpy.mockRestore();
    });

    it('should treat P2002 without email meta as 500', async () => {
      const req = {
        body: {
          name: 'Diana',
          email: 'diana@example.com',
          password: 'password123',
        },
      } as unknown as Request;
      const res = createMockRes();

      // P2002 but without email target should not hit the specific conflict branch
      const prismaUniqueErrorNoEmail = {
        code: 'P2002',
        meta: {
          target: ['username'],
        },
      };

      registerUserMock.mockRejectedValueOnce(prismaUniqueErrorNoEmail);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });

      errorSpy.mockRestore();
    });

    it('should validate behavior when body is empty object (edge case)', async () => {
      const req = { body: {} } as unknown as Request;
      const res = createMockRes();

      // Service might reject due to validation; controller should handle 500 here
      registerUserMock.mockRejectedValueOnce(Object.assign(new Error('Validation failed'), { code: 'VALERR' }));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await UserController.register(req, res);

      expect(registerUserMock).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });

      errorSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should return 200 with user and token on successful login', async () => {
      const req = {
        body: {
          email: 'eve@example.com',
          password: 'StrongPass!23',
        },
      } as unknown as Request;
      const res = createMockRes();

      const user = {
        id: 'u_999',
        name: 'Eve',
        email: 'eve@example.com',
      };
      const token = 'jwt.token.value';

      loginUserMock.mockResolvedValueOnce({ user, token });

      await UserController.login(req, res);

      expect(loginUserMock).toHaveBeenCalledTimes(1);
      expect(loginUserMock).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user,
        token,
      });
    });

    it('should return 401 when loginUser returns falsy (invalid credentials)', async () => {
      const req = {
        body: {
          email: 'wrong@example.com',
          password: 'incorrect',
        },
      } as unknown as Request;
      const res = createMockRes();

      loginUserMock.mockResolvedValueOnce(null);

      await UserController.login(req, res);

      expect(loginUserMock).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should return 500 with error message if service throws', async () => {
      const req = {
        body: {
          email: 'frank@example.com',
          password: 'whatever',
        },
      } as unknown as Request;
      const res = createMockRes();

      const thrown = new Error('DB down');
      loginUserMock.mockRejectedValueOnce(thrown);

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: thrown.message,
      });
    });

    it('should handle undefined result explicitly (edge case)', async () => {
      const req = {
        body: {
          email: 'edge@example.com',
          password: 'edge',
        },
      } as unknown as Request;
      const res = createMockRes();

      loginUserMock.mockResolvedValueOnce(undefined);

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should pass the exact credentials object to service', async () => {
      const credentials = {
        email: 'precision@example.com',
        password: 'p@ss',
      };
      const req = { body: credentials } as unknown as Request;
      const res = createMockRes();

      const user = { id: 'u_abc', name: 'Precise', email: credentials.email };
      loginUserMock.mockResolvedValueOnce({ user, token: 't' });

      await UserController.login(req, res);

      expect(loginUserMock).toHaveBeenCalledWith(credentials);
    });
  });
});