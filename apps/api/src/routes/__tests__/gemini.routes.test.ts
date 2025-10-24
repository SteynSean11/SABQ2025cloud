import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';
import geminiRoutes from '../gemini.routes';
import { GeminiController } from '../../controllers/gemini.controller';

vi.mock('../../controllers/gemini.controller');

describe('Gemini Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/gemini', geminiRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/gemini', () => {
    it('should have a POST route at /', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Content generated' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(200);
    });

    it('should call GeminiController.generateContent', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Content generated' });
      });

      await request(app)
        .post('/api/gemini')
        .send({ prompt: 'Test prompt' });

      expect(GeminiController.generateContent).toHaveBeenCalled();
    });

    it('should accept JSON body', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        expect(req.body).toHaveProperty('prompt');
        res.status(200).json({ message: 'Success' });
      });

      await request(app)
        .post('/api/gemini')
        .send({ prompt: 'What is AI?' })
        .set('Content-Type', 'application/json');

      expect(GeminiController.generateContent).toHaveBeenCalled();
    });

    it('should pass prompt to controller', async () => {
      let receivedBody: any;

      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        receivedBody = req.body;
        res.status(200).json({ message: 'Success' });
      });

      await request(app)
        .post('/api/gemini')
        .send({ prompt: 'Explain quantum computing' });

      expect(receivedBody).toEqual({ prompt: 'Explain quantum computing' });
    });

    it('should handle POST method only', async () => {
      const getResponse = await request(app).get('/api/gemini');
      const putResponse = await request(app).put('/api/gemini').send({ prompt: 'test' });
      const deleteResponse = await request(app).delete('/api/gemini');

      // GET, PUT, DELETE should not be 200
      expect(getResponse.status).not.toBe(200);
      expect(putResponse.status).not.toBe(200);
      expect(deleteResponse.status).not.toBe(200);
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'a'.repeat(5000);

      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({ prompt: longPrompt });

      expect(response.status).toBe(200);
      expect(GeminiController.generateContent).toHaveBeenCalled();
    });

    it('should handle special characters in prompt', async () => {
      const specialPrompt = 'Test @#$%^&*()_+ 你好世界 🌍';

      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({ prompt: specialPrompt });

      expect(response.status).toBe(200);
    });

    it('should handle multiline prompts', async () => {
      const multilinePrompt = 'Line 1\nLine 2\nLine 3';

      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({ prompt: multilinePrompt });

      expect(response.status).toBe(200);
    });
  });

  describe('Route configuration', () => {
    it('should export a router', () => {
      expect(geminiRoutes).toBeDefined();
      expect(typeof geminiRoutes).toBe('function');
    });

    it('should handle 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/gemini/undefined-route');

      expect(response.status).toBe(404);
    });

    it('should handle root path correctly', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/gemini/')
        .send({ prompt: 'test' });

      expect(response.status).toBe(200);
    });
  });

  describe('Content-Type handling', () => {
    it('should handle application/json content type', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ prompt: 'Test prompt' }));

      expect(response.status).toBe(200);
    });

    it('should parse JSON body correctly', async () => {
      let receivedBody: any;

      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        receivedBody = req.body;
        res.status(200).json({ message: 'Success' });
      });

      await request(app)
        .post('/api/gemini')
        .send({ prompt: 'Test prompt', additionalData: 'extra' });

      expect(receivedBody).toEqual({ 
        prompt: 'Test prompt', 
        additionalData: 'extra' 
      });
    });
  });

  describe('Error handling', () => {
    it('should handle controller errors', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        res.status(500).json({ message: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(500);
    });

    it('should handle empty body', async () => {
      vi.mocked(GeminiController.generateContent).mockImplementation((req, res) => {
        if (!req.body.prompt) {
          res.status(400).json({ message: 'Prompt is required' });
        } else {
          res.status(200).json({ message: 'Success' });
        }
      });

      const response = await request(app)
        .post('/api/gemini')
        .send({});

      expect(GeminiController.generateContent).toHaveBeenCalled();
    });
  });
});