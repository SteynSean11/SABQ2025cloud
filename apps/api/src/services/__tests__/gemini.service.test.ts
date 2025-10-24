import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService } from '../gemini.service';
import fetch from 'node-fetch';

vi.mock('node-fetch');

describe('GeminiService', () => {
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    process.env.GEMINI_API_KEY = mockApiKey;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content successfully with valid prompt', async () => {
      const prompt = 'What is AI?';
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'AI stands for Artificial Intelligence.' }],
              role: 'model',
            },
          },
        ],
      };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
        text: vi.fn(),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      const result = await GeminiService.generateContent(prompt);

      expect(fetch).toHaveBeenCalledWith(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when GEMINI_API_KEY is not defined', async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(GeminiService.generateContent('test')).rejects.toThrow(
        'GEMINI_API_KEY is not defined.'
      );
    });

    it('should throw error when API request fails', async () => {
      const prompt = 'Test prompt';
      const errorText = 'Rate limit exceeded';

      const mockFetchResponse = {
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue(errorText),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await expect(GeminiService.generateContent(prompt)).rejects.toThrow(
        `Gemini API request failed with status 429: ${errorText}`
      );
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'a'.repeat(10000);
      const mockResponse = { candidates: [{ content: { parts: [{ text: 'Response' }] } }] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      const result = await GeminiService.generateContent(longPrompt);

      expect(result).toEqual(mockResponse);
      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts[0].text).toBe(longPrompt);
    });

    it('should handle special characters in prompt', async () => {
      const prompt = 'Test @#$%^&*()';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      expect(fetch).toHaveBeenCalled();
    });

    it('should handle unicode characters in prompt', async () => {
      const prompt = '你好世界 🌍';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      expect(fetch).toHaveBeenCalled();
    });

    it('should construct correct API URL', async () => {
      const prompt = 'Test';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'),
        expect.anything()
      );
    });

    it('should include API key in URL query parameter', async () => {
      const prompt = 'Test';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      expect(callArgs[0]).toContain(`key=${mockApiKey}`);
    });

    it('should set correct headers', async () => {
      const prompt = 'Test';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      expect(callArgs[1]?.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('should format request body correctly', async () => {
      const prompt = 'Test prompt';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).toHaveProperty('contents');
      expect(body.contents).toHaveLength(1);
      expect(body.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: prompt }],
      });
    });

    it('should handle network errors', async () => {
      const prompt = 'Test';
      const error = new Error('Network error');

      vi.mocked(fetch).mockRejectedValue(error);

      await expect(GeminiService.generateContent(prompt)).rejects.toThrow('Network error');
    });

    it('should handle 400 Bad Request', async () => {
      const prompt = 'Test';
      const errorText = 'Invalid request';

      const mockFetchResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(errorText),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await expect(GeminiService.generateContent(prompt)).rejects.toThrow(
        'Gemini API request failed with status 400: Invalid request'
      );
    });

    it('should handle 401 Unauthorized', async () => {
      const prompt = 'Test';
      const errorText = 'Invalid API key';

      const mockFetchResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue(errorText),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await expect(GeminiService.generateContent(prompt)).rejects.toThrow(
        'Gemini API request failed with status 401: Invalid API key'
      );
    });

    it('should handle 500 Internal Server Error', async () => {
      const prompt = 'Test';
      const errorText = 'Server error';

      const mockFetchResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(errorText),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await expect(GeminiService.generateContent(prompt)).rejects.toThrow(
        'Gemini API request failed with status 500: Server error'
      );
    });

    it('should handle empty response body', async () => {
      const prompt = 'Test';
      const mockResponse = {};

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      const result = await GeminiService.generateContent(prompt);

      expect(result).toEqual(mockResponse);
    });

    it('should handle multiline prompts', async () => {
      const prompt = 'Line 1\nLine 2\nLine 3';
      const mockResponse = { candidates: [] };

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(fetch).mockResolvedValue(mockFetchResponse as any);

      await GeminiService.generateContent(prompt);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.contents[0].parts[0].text).toBe(prompt);
    });
  });
});