import { describe, it, expect, vi } from 'vitest';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { Request, Response } from 'express';

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/user.service', () => {
  return {
    UserService: vi.fn().mockImplementation(() => ({
      registerUser: vi.fn(),
      loginUser: vi.fn(),
    })),
  };
});

import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';

describe('User Controller', () => {
  let mockInstance: jest.Mocked<UserService>;

  beforeEach(() => {
    mockInstance = new (UserService as unknown as vi.Mock)() as any;
    vi.clearAllMocks();
  });

  it('should register a new user', async () => {
    const user = { id: '1', email: 'test@example.com', password: 'password123', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };
    (mockInstance.registerUser as unknown as vi.Mock).mockResolvedValue(user);

    const req = { body: { email: user.email, password: user.password, name: user.name } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await UserController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully', user });
  });
});

describe('User Controller', () => {
  console.log('describe block');
  it('should register a new user', async () => {
    console.log('it block');
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserService.registerUser.mockResolvedValue(user);

    const req = {
      body: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await UserController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      user,
    });
  });
});
