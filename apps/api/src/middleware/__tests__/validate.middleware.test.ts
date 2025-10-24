import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validate } from '../validate.middleware';

describe('validate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
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
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next() when validation passes', async () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('should return 400 when validation fails', async () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {
      email: 'invalid-email',
      password: '123',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.any(Array),
      })
    );
  });

  it('should format validation errors correctly', async () => {
    const schema = z.object({
      email: z.string().email(),
    });

    mockRequest.body = {
      email: 'not-an-email',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJson).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: 'email',
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('should handle missing required fields', async () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {
      email: 'test@example.com',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.any(Array),
      })
    );
  });

  it('should handle empty request body', async () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {};

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
  });

  it('should handle optional fields correctly', async () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
    });

    mockRequest.body = {
      email: 'test@example.com',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('should validate nested objects', async () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
        profile: z.object({
          age: z.number().min(0),
        }),
      }),
    });

    mockRequest.body = {
      user: {
        email: 'test@example.com',
        profile: {
          age: 25,
        },
      },
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return correct path for nested validation errors', async () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    });

    mockRequest.body = {
      user: {
        email: 'invalid',
      },
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJson).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: 'user.email',
        }),
      ]),
    });
  });

  it('should handle arrays in schema', async () => {
    const schema = z.object({
      tags: z.array(z.string()),
    });

    mockRequest.body = {
      tags: ['tag1', 'tag2', 'tag3'],
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate array items', async () => {
    const schema = z.object({
      emails: z.array(z.string().email()),
    });

    mockRequest.body = {
      emails: ['test@example.com', 'invalid-email'],
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
  });

  it('should handle multiple validation errors', async () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      age: z.number().min(0),
    });

    mockRequest.body = {
      email: 'invalid',
      password: '123',
      age: -5,
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    const callArgs = mockJson.mock.calls[0][0];
    expect(callArgs.errors.length).toBeGreaterThan(1);
  });

  it('should handle non-ZodError exceptions', async () => {
    const schema = z.object({
      email: z.string().email(),
    });

    mockRequest.body = {
      email: 'test@example.com',
    };

    // Mock parseAsync to throw a non-ZodError
    const middleware = validate(schema);
    vi.spyOn(schema, 'parseAsync').mockRejectedValue(new Error('Unexpected error'));

    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Internal server error',
      error: 'Unexpected error',
    });
  });

  it('should handle custom error messages', async () => {
    const schema = z.object({
      email: z.string().email('Please provide a valid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    });

    mockRequest.body = {
      email: 'invalid',
      password: '123',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    const callArgs = mockJson.mock.calls[0][0];
    const emailError = callArgs.errors.find((e: any) => e.path === 'email');
    expect(emailError.message).toBe('Please provide a valid email address');
  });

  it('should handle refinements', async () => {
    const schema = z.object({
      password: z.string(),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

    mockRequest.body = {
      password: 'password123',
      confirmPassword: 'different',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
  });

  it('should validate string formats correctly', async () => {
    const schema = z.object({
      email: z.string().email(),
      url: z.string().url(),
      uuid: z.string().uuid(),
    });

    mockRequest.body = {
      email: 'test@example.com',
      url: 'https://example.com',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle number validations', async () => {
    const schema = z.object({
      age: z.number().min(0).max(150),
      score: z.number().int().positive(),
    });

    mockRequest.body = {
      age: 25,
      score: 100,
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle enum validations', async () => {
    const schema = z.object({
      role: z.enum(['admin', 'user', 'guest']),
    });

    mockRequest.body = {
      role: 'admin',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject invalid enum values', async () => {
    const schema = z.object({
      role: z.enum(['admin', 'user', 'guest']),
    });

    mockRequest.body = {
      role: 'superadmin',
    };

    const middleware = validate(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
  });
});