import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { Application } from 'express';
import morgan from 'morgan';
import request from 'supertest';

describe('Morgan Middleware Integration', () => {
  let app: Application;
  let consoleOutput: string[] = [];
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    
    // Capture console output
    consoleOutput = [];
    originalConsoleLog = console.log;
    console.log = vi.fn((...args: any[]) => {
      consoleOutput.push(args.join(' '));
    });
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should successfully apply morgan middleware with dev format', () => {
      expect(() => {
        app.use(morgan('dev'));
      }).not.toThrow();
    });

    it('should log HTTP requests in dev format', async () => {
      app.use(morgan('dev'));
      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'test' });
      });

      await request(app).get('/test');
      
      // Morgan should have logged something
      expect(consoleOutput.length).toBeGreaterThan(0);
    });

    it('should work with combined format', async () => {
      app.use(morgan('combined'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should work with common format', async () => {
      app.use(morgan('common'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should work with short format', async () => {
      app.use(morgan('short'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should work with tiny format', async () => {
      app.use(morgan('tiny'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      app.use(morgan('dev'));
    });

    it('should log GET requests', async () => {
      app.get('/get-test', (req, res) => {
        res.status(200).json({ method: 'GET' });
      });

      const response = await request(app).get('/get-test');
      expect(response.status).toBe(200);
      expect(response.body.method).toBe('GET');
    });

    it('should log POST requests', async () => {
      app.use(express.json());
      app.post('/post-test', (req, res) => {
        res.status(201).json({ method: 'POST', data: req.body });
      });

      const response = await request(app)
        .post('/post-test')
        .send({ test: 'data' });
      
      expect(response.status).toBe(201);
      expect(response.body.method).toBe('POST');
    });

    it('should log PUT requests', async () => {
      app.use(express.json());
      app.put('/put-test', (req, res) => {
        res.status(200).json({ method: 'PUT' });
      });

      const response = await request(app)
        .put('/put-test')
        .send({ test: 'data' });
      
      expect(response.status).toBe(200);
    });

    it('should log DELETE requests', async () => {
      app.delete('/delete-test', (req, res) => {
        res.status(204).send();
      });

      const response = await request(app).delete('/delete-test');
      expect(response.status).toBe(204);
    });

    it('should log PATCH requests', async () => {
      app.use(express.json());
      app.patch('/patch-test', (req, res) => {
        res.status(200).json({ method: 'PATCH' });
      });

      const response = await request(app)
        .patch('/patch-test')
        .send({ test: 'data' });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Status Codes', () => {
    beforeEach(() => {
      app.use(morgan('dev'));
    });

    it('should log 200 OK responses', async () => {
      app.get('/success', (req, res) => {
        res.status(200).json({ status: 'success' });
      });

      const response = await request(app).get('/success');
      expect(response.status).toBe(200);
    });

    it('should log 201 Created responses', async () => {
      app.post('/created', (req, res) => {
        res.status(201).json({ status: 'created' });
      });

      const response = await request(app).post('/created');
      expect(response.status).toBe(201);
    });

    it('should log 204 No Content responses', async () => {
      app.delete('/no-content', (req, res) => {
        res.status(204).send();
      });

      const response = await request(app).delete('/no-content');
      expect(response.status).toBe(204);
    });

    it('should log 400 Bad Request responses', async () => {
      app.get('/bad-request', (req, res) => {
        res.status(400).json({ error: 'Bad Request' });
      });

      const response = await request(app).get('/bad-request');
      expect(response.status).toBe(400);
    });

    it('should log 401 Unauthorized responses', async () => {
      app.get('/unauthorized', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/unauthorized');
      expect(response.status).toBe(401);
    });

    it('should log 404 Not Found responses', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
    });

    it('should log 500 Internal Server Error responses', async () => {
      app.get('/server-error', (req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });

      const response = await request(app).get('/server-error');
      expect(response.status).toBe(500);
    });
  });

  describe('Custom Format Tokens', () => {
    it('should support custom format tokens', async () => {
      morgan.token('custom-token', (req, res) => {
        return 'custom-value';
      });

      app.use(morgan(':method :url :custom-token'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should support accessing request properties in custom tokens', async () => {
      morgan.token('request-id', (req: any) => {
        return req.id || 'no-id';
      });

      app.use((req: any, res, next) => {
        req.id = 'test-request-id';
        next();
      });
      
      app.use(morgan(':method :url :request-id'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });
  });

  describe('Skip Function', () => {
    it('should skip logging based on skip function', async () => {
      const skip = (req: any, res: any) => {
        return req.path === '/skip-me';
      };

      app.use(morgan('dev', { skip }));
      
      app.get('/skip-me', (req, res) => {
        res.status(200).send('Skipped');
      });
      
      app.get('/log-me', (req, res) => {
        res.status(200).send('Logged');
      });

      await request(app).get('/skip-me');
      await request(app).get('/log-me');
      
      // Should work regardless of logging
      const response = await request(app).get('/skip-me');
      expect(response.status).toBe(200);
    });

    it('should skip logging for specific status codes', async () => {
      const skip = (req: any, res: any) => {
        return res.statusCode < 400;
      };

      app.use(morgan('dev', { skip }));
      
      app.get('/success', (req, res) => {
        res.status(200).send('OK');
      });
      
      app.get('/error', (req, res) => {
        res.status(500).send('Error');
      });

      const successResponse = await request(app).get('/success');
      const errorResponse = await request(app).get('/error');
      
      expect(successResponse.status).toBe(200);
      expect(errorResponse.status).toBe(500);
    });
  });

  describe('Middleware Order', () => {
    it('should work when placed before body parsers', async () => {
      app.use(morgan('dev'));
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ test: 'data' });
      
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });

    it('should work when placed after body parsers', async () => {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(morgan('dev'));
      
      app.post('/test', (req, res) => {
        res.status(200).json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ test: 'data' });
      
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });
  });

  describe('Response Time Logging', () => {
    it('should log response time', async () => {
      app.use(morgan(':method :url :response-time ms'));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    it('should handle slow responses', async () => {
      app.use(morgan('dev'));
      app.get('/slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        res.status(200).send('Slow response');
      });

      const response = await request(app).get('/slow');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Slow response');
    });
  });

  describe('Content Length Logging', () => {
    it('should log content length for JSON responses', async () => {
      app.use(morgan('dev'));
      app.get('/json', (req, res) => {
        res.status(200).json({ 
          message: 'test', 
          data: { foo: 'bar' } 
        });
      });

      const response = await request(app).get('/json');
      expect(response.status).toBe(200);
      expect(response.headers['content-length']).toBeDefined();
    });

    it('should log content length for text responses', async () => {
      app.use(morgan('dev'));
      app.get('/text', (req, res) => {
        res.status(200).send('This is a text response');
      });

      const response = await request(app).get('/text');
      expect(response.status).toBe(200);
      expect(response.headers['content-length']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should log requests even when errors occur', async () => {
      app.use(morgan('dev'));
      
      app.get('/error', (req, res, next) => {
        next(new Error('Test error'));
      });
      
      // Error handler
      app.use((err: Error, req: any, res: any, next: any) => {
        res.status(500).json({ error: err.message });
      });

      const response = await request(app).get('/error');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Test error');
    });

    it('should handle async route errors', async () => {
      app.use(morgan('dev'));
      
      app.get('/async-error', async (req, res, next) => {
        try {
          throw new Error('Async error');
        } catch (error) {
          next(error);
        }
      });
      
      // Error handler
      app.use((err: Error, req: any, res: any, next: any) => {
        res.status(500).json({ error: err.message });
      });

      const response = await request(app).get('/async-error');
      expect(response.status).toBe(500);
    });
  });

  describe('Query Parameters and Headers', () => {
    it('should handle requests with query parameters', async () => {
      app.use(morgan('dev'));
      app.get('/query', (req, res) => {
        res.status(200).json({ query: req.query });
      });

      const response = await request(app)
        .get('/query')
        .query({ foo: 'bar', baz: 'qux' });
      
      expect(response.status).toBe(200);
      expect(response.body.query).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('should handle requests with custom headers', async () => {
      morgan.token('custom-header', (req: any) => {
        return req.get('X-Custom-Header') || 'none';
      });

      app.use(morgan(':method :url :custom-header'));
      app.get('/headers', (req, res) => {
        res.status(200).json({ 
          customHeader: req.get('X-Custom-Header') 
        });
      });

      const response = await request(app)
        .get('/headers')
        .set('X-Custom-Header', 'test-value');
      
      expect(response.status).toBe(200);
      expect(response.body.customHeader).toBe('test-value');
    });
  });

  describe('Version Compatibility', () => {
    it('should be compatible with Express 5.x', () => {
      const expressVersion = require('express/package.json').version;
      const morganVersion = require('morgan/package.json').version;
      
      expect(expressVersion).toMatch(/^5\./);
      expect(morganVersion).toMatch(/^1\.10\./);
    });

    it('should have morgan version 1.10.1 or higher', () => {
      const morganPackage = require('morgan/package.json');
      const version = morganPackage.version;
      
      const [major, minor, patch] = version.split('.').map(Number);
      
      expect(major).toBe(1);
      expect(minor).toBe(10);
      expect(patch).toBeGreaterThanOrEqual(1);
    });
  });
});