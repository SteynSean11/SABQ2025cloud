import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';

describe('Express App Integration with Morgan', () => {
  let app: Application;
  
  beforeAll(() => {
    // Mock environment variable
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Complete Middleware Stack', () => {
    beforeEach(() => {
      // Create app with complete middleware stack similar to index.ts
      app = express();
      app.use(cors());
      app.use(morgan('dev'));
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      // Add test routes
      app.get('/', (req, res) => {
        res.send('SA Budget Queen API is running\!');
      });
      
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy' });
      });
    });

    it('should handle root route correctly', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('SA Budget Queen API is running\!');
    });

    it('should log requests through morgan middleware', async () => {
      const logs: string[] = [];
      
      // Create app with custom stream to capture logs
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(cors());
      testApp.use(morgan('dev', { stream }));
      testApp.use(express.json());
      
      testApp.get('/test', (req, res) => {
        res.status(200).json({ message: 'test' });
      });

      await request(testApp).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('GET');
      expect(logs[0]).toContain('/test');
      expect(logs[0]).toContain('200');
    });

    it('should process CORS before morgan', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://example.com');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should parse JSON bodies after morgan', async () => {
      app.post('/api/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/api/test')
        .send({ test: 'data', value: 123 })
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data', value: 123 });
    });

    it('should parse URL-encoded bodies', async () => {
      app.post('/api/form', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/api/form')
        .send('name=test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded');
      
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ name: 'test', value: '123' });
    });
  });

  describe('Middleware Order and Interaction', () => {
    it('should apply middleware in correct order', async () => {
      const executionOrder: string[] = [];
      
      const testApp = express();
      
      // Track middleware execution order
      testApp.use((req, res, next) => {
        executionOrder.push('cors-like');
        next();
      });
      
      testApp.use(morgan('dev'));
      
      testApp.use((req, res, next) => {
        executionOrder.push('body-parser-like');
        next();
      });
      
      testApp.get('/test', (req, res) => {
        executionOrder.push('route-handler');
        res.status(200).send('OK');
      });

      await request(testApp).get('/test');
      
      expect(executionOrder).toEqual([
        'cors-like',
        'body-parser-like',
        'route-handler'
      ]);
    });

    it('should log all types of requests', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      const testApp = express();
      testApp.use(morgan('dev', { stream }));
      testApp.use(express.json());
      
      testApp.get('/get', (req, res) => res.status(200).send('GET'));
      testApp.post('/post', (req, res) => res.status(201).send('POST'));
      testApp.put('/put', (req, res) => res.status(200).send('PUT'));
      testApp.delete('/delete', (req, res) => res.status(204).send());
      testApp.patch('/patch', (req, res) => res.status(200).send('PATCH'));

      await request(testApp).get('/get');
      await request(testApp).post('/post');
      await request(testApp).put('/put');
      await request(testApp).delete('/delete');
      await request(testApp).patch('/patch');
      
      expect(logs.length).toBe(5);
      expect(logs.some(log => log.includes('GET'))).toBe(true);
      expect(logs.some(log => log.includes('POST'))).toBe(true);
      expect(logs.some(log => log.includes('PUT'))).toBe(true);
      expect(logs.some(log => log.includes('DELETE'))).toBe(true);
      expect(logs.some(log => log.includes('PATCH'))).toBe(true);
    });
  });

  describe('API Routes with Morgan', () => {
    beforeEach(() => {
      app = express();
      app.use(cors());
      app.use(morgan('dev'));
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
    });

    it('should log user registration attempts', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      testApp.use(express.json());
      
      testApp.post('/api/users/register', (req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      await request(testApp)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'password123' });
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('POST');
      expect(logs[0]).toContain('/api/users/register');
      expect(logs[0]).toContain('201');
    });

    it('should log login attempts', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      testApp.use(express.json());
      
      testApp.post('/api/users/login', (req, res) => {
        res.status(200).json({ token: 'fake-jwt-token' });
      });

      await request(testApp)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('POST');
      expect(logs[0]).toContain('/api/users/login');
    });

    it('should log API errors', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      
      testApp.get('/api/error', (req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });

      await request(testApp).get('/api/error');
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('500');
    });
  });

  describe('Morgan Format Options', () => {
    it('should work with dev format (default)', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      testApp.get('/test', (req, res) => res.status(200).send('OK'));

      await request(testApp).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
      // Dev format includes colored output
      expect(logs[0]).toContain('GET');
      expect(logs[0]).toContain('/test');
      expect(logs[0]).toContain('200');
    });

    it('should work with combined format', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('combined', { stream }));
      testApp.get('/test', (req, res) => res.status(200).send('OK'));

      await request(testApp).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
      // Combined format is more verbose
      expect(logs[0]).toContain('GET /test');
    });

    it('should support custom format tokens', async () => {
      const logs: string[] = [];
      
      // Define custom token
      morgan.token('request-time', () => {
        return new Date().toISOString();
      });
      
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan(':method :url :status :request-time', { stream }));
      testApp.get('/test', (req, res) => res.status(200).send('OK'));

      await request(testApp).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('GET');
      expect(logs[0]).toContain('/test');
      expect(logs[0]).toContain('200');
    });
  });

  describe('Production-like Scenarios', () => {
    it('should handle high request volume', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      testApp.get('/api/data', (req, res) => {
        res.status(200).json({ data: 'response' });
      });

      // Simulate 50 concurrent requests
      const requests = Array(50).fill(null).map(() => 
        request(testApp).get('/api/data')
      );

      const responses = await Promise.all(requests);
      
      expect(responses.length).toBe(50);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(logs.length).toBe(50);
    });

    it('should handle requests with various status codes', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      
      testApp.get('/200', (req, res) => res.status(200).send('OK'));
      testApp.get('/201', (req, res) => res.status(201).send('Created'));
      testApp.get('/204', (req, res) => res.status(204).send());
      testApp.get('/400', (req, res) => res.status(400).send('Bad Request'));
      testApp.get('/401', (req, res) => res.status(401).send('Unauthorized'));
      testApp.get('/403', (req, res) => res.status(403).send('Forbidden'));
      testApp.get('/404', (req, res) => res.status(404).send('Not Found'));
      testApp.get('/500', (req, res) => res.status(500).send('Server Error'));

      await request(testApp).get('/200');
      await request(testApp).get('/201');
      await request(testApp).get('/204');
      await request(testApp).get('/400');
      await request(testApp).get('/401');
      await request(testApp).get('/403');
      await request(testApp).get('/404');
      await request(testApp).get('/500');
      
      expect(logs.length).toBe(8);
      expect(logs.some(log => log.includes('200'))).toBe(true);
      expect(logs.some(log => log.includes('201'))).toBe(true);
      expect(logs.some(log => log.includes('204'))).toBe(true);
      expect(logs.some(log => log.includes('400'))).toBe(true);
      expect(logs.some(log => log.includes('401'))).toBe(true);
      expect(logs.some(log => log.includes('403'))).toBe(true);
      expect(logs.some(log => log.includes('404'))).toBe(true);
      expect(logs.some(log => log.includes('500'))).toBe(true);
    });

    it('should log response times accurately', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan(':method :url :response-time ms', { stream }));
      
      testApp.get('/fast', (req, res) => {
        res.status(200).send('Fast');
      });
      
      testApp.get('/slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        res.status(200).send('Slow');
      });

      await request(testApp).get('/fast');
      await request(testApp).get('/slow');
      
      expect(logs.length).toBe(2);
      
      // Both should have response times logged
      expect(logs[0]).toMatch(/\d+\.\d+/);
      expect(logs[1]).toMatch(/\d+\.\d+/);
      
      // Extract response times
      const fastTime = parseFloat(logs[0].match(/(\d+\.\d+)/)?.[1] || '0');
      const slowTime = parseFloat(logs[1].match(/(\d+\.\d+)/)?.[1] || '0');
      
      // Slow endpoint should take longer
      expect(slowTime).toBeGreaterThan(fastTime);
    });
  });

  describe('Error Handling with Morgan', () => {
    it('should log requests even when application errors occur', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      
      testApp.get('/error', (req, res, next) => {
        next(new Error('Application error'));
      });
      
      // Error handler
      testApp.use((err: Error, req: any, res: any, next: any) => {
        res.status(500).json({ error: err.message });
      });

      const response = await request(testApp).get('/error');
      
      expect(response.status).toBe(500);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should handle middleware chain interruptions', async () => {
      const logs: string[] = [];
      const testApp = express();
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };
      
      testApp.use(morgan('dev', { stream }));
      
      // Middleware that stops the chain
      testApp.use((req, res, next) => {
        if (req.path === '/blocked') {
          return res.status(403).send('Blocked');
        }
        next();
      });
      
      testApp.get('/allowed', (req, res) => {
        res.status(200).send('Allowed');
      });

      await request(testApp).get('/blocked');
      await request(testApp).get('/allowed');
      
      expect(logs.length).toBe(2);
      expect(logs[0]).toContain('403');
      expect(logs[1]).toContain('200');
    });
  });

  describe('Morgan Version Compatibility', () => {
    it('should verify morgan is at version 1.10.1 or higher', () => {
      const morganPackage = require('morgan/package.json');
      const version = morganPackage.version;
      
      const [major, minor, patch] = version.split('.').map(Number);
      
      expect(major).toBe(1);
      expect(minor).toBe(10);
      expect(patch).toBeGreaterThanOrEqual(1);
    });

    it('should be compatible with current Express version', () => {
      const expressPackage = require('express/package.json');
      const morganPackage = require('morgan/package.json');
      
      const expressVersion = expressPackage.version;
      const morganVersion = morganPackage.version;
      
      // Express 5.x should work with Morgan 1.10.x
      expect(expressVersion).toMatch(/^5\./);
      expect(morganVersion).toMatch(/^1\.10\./);
    });

    it('should verify type definitions are available', () => {
      // This test ensures @types/morgan is properly installed
      expect(() => {
        require('@types/morgan');
      }).not.toThrow();
    });
  });
});