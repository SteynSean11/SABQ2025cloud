import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { GeminiController } from '../gemini.controller';
import { GeminiService } from '../../services/gemini.service';

vi.mock('../../services/gemini.service');

describe('GeminiController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

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
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content successfully with valid prompt', async () => {
      const prompt = 'What is the weather today?';
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'I cannot provide real-time weather information.' }],
              role: 'model',
            },
          },
        ],
      };

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(GeminiService.generateContent).toHaveBeenCalledWith(prompt);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when prompt is missing', async () => {
      mockRequest.body = {};

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(GeminiService.generateContent).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Prompt is required',
      });
    });

    it('should return 400 when prompt is null', async () => {
      mockRequest.body = { prompt: null };

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Prompt is required',
      });
    });

    it('should return 400 when prompt is empty string', async () => {
      mockRequest.body = { prompt: '' };

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Prompt is required',
      });
    });

    it('should return 400 when prompt is undefined', async () => {
      mockRequest.body = { prompt: undefined };

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should handle service errors with 500 status', async () => {
      const prompt = 'Test prompt';
      const error = new Error('API request failed');

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockRejectedValue(error);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should handle API rate limit errors', async () => {
      const prompt = 'Test prompt';
      const error = new Error('Rate limit exceeded');

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockRejectedValue(error);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const prompt = 'Test prompt';
      const error = new Error('Network error');

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockRejectedValue(error);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'a'.repeat(10000);
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response to long prompt' }],
              role: 'model',
            },
          },
        ],
      };

      mockRequest.body = { prompt: longPrompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(GeminiService.generateContent).toHaveBeenCalledWith(longPrompt);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle special characters in prompt', async () => {
      const prompt = 'Test with special chars: @#$%^&*()_+{}|:"<>?';
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response' }],
              role: 'model',
            },
          },
        ],
      };

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle unicode characters in prompt', async () => {
      const prompt = '你好世界 🌍';
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response' }],
              role: 'model',
            },
          },
        ],
      };

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle multiline prompts', async () => {
      const prompt = 'Line 1\nLine 2\nLine 3';
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response' }],
              role: 'model',
            },
          },
        ],
      };

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle timeout errors', async () => {
      const prompt = 'Test prompt';
      const error = new Error('Request timeout');

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockRejectedValue(error);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', error);
    });

    it('should handle empty response from service', async () => {
      const prompt = 'Test prompt';
      const mockResult = {};

      mockRequest.body = { prompt };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should handle whitespace-only prompt', async () => {
      const mockResult = { candidates: [] };
      mockRequest.body = { prompt: '   ' };
      vi.mocked(GeminiService.generateContent).mockResolvedValue(mockResult);

      await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

      expect(GeminiService.generateContent).toHaveBeenCalledWith('   ');
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });
});