import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';
import userRoutes from '../user.routes';
import { UserController } from '../../controllers/user.controller';
import { validate } from '../../middleware/validate.middleware';

vi.mock('../../controllers/user.controller');
vi.mock('../../middleware/validate.middleware');

describe('User Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    vi.clearAllMocks();

    // Mock the validate middleware to pass through by default
    vi.mocked(validate).mockImplementation(() => (req, res, next) => next());
  });

  describe('POST /api/users/register', () => {
    it('should have a register route', async () => {
      vi.mocked(UserController.register).mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
    });

    it('should call UserController.register', async () => {
      vi.mocked(UserController.register).mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(UserController.register).toHaveBeenCalled();
    });

    it('should apply validation middleware', async () => {
      vi.mocked(UserController.register).mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(validate).toHaveBeenCalled();
    });

    it('should accept JSON body', async () => {
      vi.mocked(UserController.register).mockImplementation((req, res) => {
        expect(req.body).toHaveProperty('email');
        expect(req.body).toHaveProperty('password');
        res.status(201).json({ message: 'User registered' });
      });

      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .set('Content-Type', 'application/json');

      expect(UserController.register).toHaveBeenCalled();
    });

    it('should handle POST method only', async () => {
      const response = await request(app)
        .get('/api/users/register');

      expect(response.status).not.toBe(200);
      expect(response.status).not.toBe(201);
    });
  });

  describe('POST /api/users/login', () => {
    it('should have a login route', async () => {
      vi.mocked(UserController.login).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Login successful' });
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
    });

    it('should call UserController.login', async () => {
      vi.mocked(UserController.login).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Login successful' });
      });

      await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(UserController.login).toHaveBeenCalled();
    });

    it('should apply validation middleware', async () => {
      vi.mocked(UserController.login).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Login successful' });
      });

      await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(validate).toHaveBeenCalled();
    });

    it('should accept JSON body', async () => {
      vi.mocked(UserController.login).mockImplementation((req, res) => {
        expect(req.body).toHaveProperty('email');
        expect(req.body).toHaveProperty('password');
        res.status(200).json({ message: 'Login successful' });
      });

      await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .set('Content-Type', 'application/json');

      expect(UserController.login).toHaveBeenCalled();
    });

    it('should handle POST method only', async () => {
      const response = await request(app)
        .get('/api/users/login');

      expect(response.status).not.toBe(200);
    });
  });

  describe('Route configuration', () => {
    it('should export a router', () => {
      expect(userRoutes).toBeDefined();
      expect(typeof userRoutes).toBe('function');
    });

    it('should handle 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/users/undefined-route');

      expect(response.status).toBe(404);
    });

    it('should handle different HTTP methods appropriately', async () => {
      const putResponse = await request(app)
        .put('/api/users/register')
        .send({ email: 'test@example.com' });

      expect(putResponse.status).not.toBe(200);
      expect(putResponse.status).not.toBe(201);
    });
  });

  describe('Integration with middleware', () => {
    it('should process middleware before controller', async () => {
      const order: string[] = [];

      vi.mocked(validate).mockImplementation(() => (req, res, next) => {
        order.push('validate');
        next();
      });

      vi.mocked(UserController.register).mockImplementation((req, res) => {
        order.push('controller');
        res.status(201).json({ message: 'Success' });
      });

      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(order).toEqual(['validate', 'controller']);
    });

    it('should stop at middleware if validation fails', async () => {
      vi.mocked(validate).mockImplementation(() => (req, res, next) => {
        res.status(400).json({ message: 'Validation failed' });
      });

      vi.mocked(UserController.register).mockImplementation((req, res) => {
        res.status(201).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(UserController.register).not.toHaveBeenCalled();
    });
  });

  describe('Content-Type handling', () => {
    it('should handle application/json content type', async () => {
      vi.mocked(UserController.register).mockImplementation((req, res) => {
        res.status(201).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }));

      expect(response.status).toBe(201);
    });

    it('should parse JSON body correctly', async () => {
      let receivedBody: any;

      vi.mocked(UserController.register).mockImplementation((req, res) => {
        receivedBody = req.body;
        res.status(201).json({ message: 'Success' });
      });

      await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(receivedBody).toEqual({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });
  });
});