import { describe, it, expect, beforeEach } from 'vitest';
import express, { Application } from 'express';
import morgan from 'morgan';
import request from 'supertest';

describe('Morgan Configuration and Options', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
  });

  describe('Stream Options', () => {
    it('should accept custom stream', async () => {
      let capturedLog = '';
      const customStream = {
        write: (message: string) => {
          capturedLog += message;
        }
      };

      app.use(morgan('dev', { stream: customStream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(capturedLog).toContain('GET');
      expect(capturedLog).toContain('/test');
    });

    it('should support multiple stream formats', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.use(morgan('combined', { stream }));
      
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Immediate Option', () => {
    it('should log immediately when immediate option is true', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { 
        stream,
        immediate: true 
      }));
      
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should log after response when immediate option is false', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { 
        stream,
        immediate: false 
      }));
      
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Format Strings', () => {
    it('should support custom format strings', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':method :url :status', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs[0]).toContain('GET');
      expect(logs[0]).toContain('/test');
      expect(logs[0]).toContain('200');
    });

    it('should support multiple tokens in format', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { 
        stream 
      }));
      
      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'test' });
      });

      await request(app).get('/test');
      
      expect(logs[0]).toContain('GET');
      expect(logs[0]).toContain('200');
      expect(logs[0]).toContain('ms');
    });
  });

  describe('Token Functions', () => {
    it('should support date token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':date[iso]', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs[0]).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should support http-version token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':http-version', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs[0]).toMatch(/\d\.\d/);
    });

    it('should support referrer token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':referrer', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app)
        .get('/test')
        .set('Referer', 'http://example.com');
      
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should support user-agent token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':user-agent', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should support remote-addr token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':remote-addr', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should support remote-user token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':remote-user', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Response Header Tokens', () => {
    it('should log response headers using :res token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':method :url :res[content-type]', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'test' });
      });

      await request(app).get('/test');
      
      expect(logs[0]).toContain('application/json');
    });

    it('should handle missing response headers gracefully', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':res[x-custom-header]', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Request Header Tokens', () => {
    it('should log request headers using :req token', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':req[x-custom-header]', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app)
        .get('/test')
        .set('X-Custom-Header', 'custom-value');
      
      expect(logs[0]).toContain('custom-value');
    });

    it('should handle missing request headers gracefully', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan(':req[x-missing-header]', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test');
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes with special characters', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.get('/test/:id', (req, res) => {
        res.status(200).send('OK');
      });

      await request(app).get('/test/123-abc_def');
      
      expect(logs[0]).toContain('/test/123-abc_def');
    });

    it('should handle very long URLs', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const longQuery = 'a'.repeat(1000);
      await request(app).get(`/test?param=${longQuery}`);
      
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should handle concurrent requests', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const requests = Array(10).fill(null).map(() => 
        request(app).get('/test')
      );

      await Promise.all(requests);
      
      expect(logs.length).toBe(10);
    });

    it('should handle empty response bodies', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.get('/empty', (req, res) => {
        res.status(204).end();
      });

      const response = await request(app).get('/empty');
      
      expect(response.status).toBe(204);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should handle large response bodies', async () => {
      const logs: string[] = [];
      const stream = {
        write: (message: string) => {
          logs.push(message);
        }
      };

      app.use(morgan('dev', { stream }));
      app.get('/large', (req, res) => {
        const largeData = { data: 'x'.repeat(10000) };
        res.status(200).json(largeData);
      });

      const response = await request(app).get('/large');
      
      expect(response.status).toBe(200);
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should not significantly impact response time', async () => {
      const appWithMorgan = express();
      const appWithoutMorgan = express();

      appWithMorgan.use(morgan('dev'));
      appWithMorgan.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      appWithoutMorgan.get('/test', (req, res) => {
        res.status(200).send('OK');
      });

      const startWith = Date.now();
      await request(appWithMorgan).get('/test');
      const timeWith = Date.now() - startWith;

      const startWithout = Date.now();
      await request(appWithoutMorgan).get('/test');
      const timeWithout = Date.now() - startWithout;

      // Morgan should not add significant overhead (allow 100ms tolerance)
      expect(timeWith - timeWithout).toBeLessThan(100);
    });
  });
});