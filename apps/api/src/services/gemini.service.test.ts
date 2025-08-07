import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fetch from 'node-fetch';
import { GeminiService } from './gemini.service';

// Mock node-fetch
vi.mock('node-fetch');
const mockFetch = vi.mocked(fetch);

describe('GeminiService', () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  const mockApiKey = 'test-gemini-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = mockApiKey;
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe('generateContent', () => {
    const mockSuccessResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Generated response from Gemini API"
              }
            ]
          },
          finishReason: "STOP"
        }
      ]
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockSuccessResponse),
        text: vi.fn().mockResolvedValue(JSON.stringify(mockSuccessResponse))
      } as any);
    });

    it('should generate content successfully with valid prompt', async () => {
      const prompt = 'Hello, world!';
      const result = await GeminiService.generateContent(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          })
        }
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle empty prompt', async () => {
      const prompt = '';
      await GeminiService.generateContent(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: '' }] }]
          })
        })
      );
    });

    it('should handle prompts with special characters', async () => {
      const specialPrompt = 'Hello! @#$%^&*()_+ "quotes" and <tags>';
      await GeminiService.generateContent(specialPrompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: specialPrompt }] }]
          })
        })
      );
    });

    it('should handle unicode and emoji characters', async () => {
      const unicodePrompt = '你好世界! 🌍 Émojis and ñoñó';
      await GeminiService.generateContent(unicodePrompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: unicodePrompt }] }]
          })
        })
      );
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'A'.repeat(10000);
      await GeminiService.generateContent(longPrompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: longPrompt }] }]
          })
        })
      );
    });

    it('should handle prompts with line breaks and tabs', async () => {
      const multilinePrompt = 'Line 1\nLine 2\n\tIndented line\r\nWindows line break';
      await GeminiService.generateContent(multilinePrompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: multilinePrompt }] }]
          })
        })
      );
    });

    it('should use correct API endpoint with API key', async () => {
      const prompt = 'test prompt';
      await GeminiService.generateContent(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
        expect.any(Object)
      );
    });

    it('should send correct request headers', async () => {
      const prompt = 'test prompt';
      await GeminiService.generateContent(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should send correct request payload structure', async () => {
      const prompt = 'test prompt';
      await GeminiService.generateContent(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          })
        })
      );
    });

    it('should return parsed JSON response', async () => {
      const customResponse = {
        candidates: [
          {
            content: { parts: [{ text: "Custom response" }] },
            finishReason: "STOP"
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(customResponse)
      } as any);

      const result = await GeminiService.generateContent('test');
      expect(result).toEqual(customResponse);
    });
  });

  describe('error handling', () => {
    it('should throw error when GEMINI_API_KEY is not defined', async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('GEMINI_API_KEY is not defined.');
    });

    it('should throw error when GEMINI_API_KEY is empty string', async () => {
      process.env.GEMINI_API_KEY = '';

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('GEMINI_API_KEY is not defined.');
    });

    it('should handle 400 Bad Request error', async () => {
      const errorText = 'Invalid request payload';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue(errorText)
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow(`Gemini API request failed with status 400: ${errorText}`);
    });

    it('should handle 401 Unauthorized error', async () => {
      const errorText = 'API key invalid';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue(errorText)
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow(`Gemini API request failed with status 401: ${errorText}`);
    });

    it('should handle 403 Forbidden error', async () => {
      const errorText = 'Access denied';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: vi.fn().mockResolvedValue(errorText)
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow(`Gemini API request failed with status 403: ${errorText}`);
    });

    it('should handle 429 Rate Limit error', async () => {
      const errorText = 'Rate limit exceeded';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue(errorText)
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow(`Gemini API request failed with status 429: ${errorText}`);
    });

    it('should handle 500 Internal Server Error', async () => {
      const errorText = 'Internal server error';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(errorText)
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow(`Gemini API request failed with status 500: ${errorText}`);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error: ECONNREFUSED');
      mockFetch.mockRejectedValue(networkError);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('Network error: ECONNREFUSED');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('Request timeout');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('Unexpected token');
    });

    it('should handle malformed error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockRejectedValue(new Error('Failed to read response'))
      } as any);

      await expect(GeminiService.generateContent('test prompt'))
        .rejects
        .toThrow('Failed to read response');
    });
  });

  describe('input validation and edge cases', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      } as any);
    });

    it('should handle null prompt', async () => {
      await GeminiService.generateContent(null as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: null }] }]
          })
        })
      );
    });

    it('should handle undefined prompt', async () => {
      await GeminiService.generateContent(undefined as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: undefined }] }]
          })
        })
      );
    });

    it('should handle numeric input', async () => {
      await GeminiService.generateContent(123 as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 123 }] }]
          })
        })
      );
    });

    it('should handle boolean input', async () => {
      await GeminiService.generateContent(true as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: true }] }]
          })
        })
      );
    });

    it('should handle object input', async () => {
      const objectPrompt = { message: 'hello' };
      await GeminiService.generateContent(objectPrompt as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: objectPrompt }] }]
          })
        })
      );
    });

    it('should handle array input', async () => {
      const arrayPrompt = ['hello', 'world'];
      await GeminiService.generateContent(arrayPrompt as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: arrayPrompt }] }]
          })
        })
      );
    });

    it('should handle whitespace-only prompt', async () => {
      const whitespacePrompt = '   \n\t\r  ';
      await GeminiService.generateContent(whitespacePrompt);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: whitespacePrompt }] }]
          })
        })
      );
    });
  });

  describe('API response handling', () => {
    it('should handle response with multiple candidates', async () => {
      const multiCandidateResponse = {
        candidates: [
          {
            content: { parts: [{ text: "Response 1" }] },
            finishReason: "STOP"
          },
          {
            content: { parts: [{ text: "Response 2" }] },
            finishReason: "STOP"
          }
        ]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(multiCandidateResponse)
      } as any);

      const result = await GeminiService.generateContent('test');
      expect(result).toEqual(multiCandidateResponse);
    });

    it('should handle response with safety ratings', async () => {
      const responseWithSafety = {
        candidates: [
          {
            content: { parts: [{ text: "Safe response" }] },
            finishReason: "STOP",
            safetyRatings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                probability: "NEGLIGIBLE"
              }
            ]
          }
        ]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(responseWithSafety)
      } as any);

      const result = await GeminiService.generateContent('test');
      expect(result).toEqual(responseWithSafety);
    });

    it('should handle blocked content response', async () => {
      const blockedResponse = {
        candidates: [
          {
            finishReason: "SAFETY",
            safetyRatings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                probability: "HIGH"
              }
            ]
          }
        ]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(blockedResponse)
      } as any);

      const result = await GeminiService.generateContent('potentially harmful content');
      expect(result).toEqual(blockedResponse);
    });

    it('should handle response with citation metadata', async () => {
      const responseWithCitation = {
        candidates: [
          {
            content: { parts: [{ text: "Response with citations" }] },
            finishReason: "STOP",
            citationMetadata: {
              citationSources: [
                {
                  startIndex: 0,
                  endIndex: 10,
                  uri: "https://example.com"
                }
              ]
            }
          }
        ]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(responseWithCitation)
      } as any);

      const result = await GeminiService.generateContent('test');
      expect(result).toEqual(responseWithCitation);
    });

    it('should handle empty response', async () => {
      const emptyResponse = {};

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(emptyResponse)
      } as any);

      const result = await GeminiService.generateContent('test');
      expect(result).toEqual(emptyResponse);
    });
  });

  describe('performance and reliability', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      } as any);
    });

    it('should handle concurrent requests', async () => {
      const prompts = ['prompt1', 'prompt2', 'prompt3', 'prompt4', 'prompt5'];
      const promises = prompts.map(prompt => GeminiService.generateContent(prompt));

      await Promise.all(promises);

      expect(mockFetch).toHaveBeenCalledTimes(5);
      prompts.forEach((prompt, index) => {
        expect(mockFetch).toHaveBeenNthCalledWith(
          index + 1,
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })
          })
        );
      });
    });

    it('should handle requests with different API keys', async () => {
      // First request with initial API key
      await GeminiService.generateContent('test1');

      // Change API key
      process.env.GEMINI_API_KEY = 'different-api-key';

      // Second request with new API key
      await GeminiService.generateContent('test2');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=different-api-key',
        expect.any(Object)
      );
    });

    it('should preserve request independence', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ result: 'first' })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ result: 'second' })
        } as any);

      const [result1, result2] = await Promise.all([
        GeminiService.generateContent('prompt1'),
        GeminiService.generateContent('prompt2')
      ]);

      expect(result1).toEqual({ result: 'first' });
      expect(result2).toEqual({ result: 'second' });
    });
  });

  describe('static method behavior', () => {
    it('should be callable as static method', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      } as any);

      // Should be able to call without instantiation
      const result = await GeminiService.generateContent('test');
      expect(result).toEqual({ success: true });
    });

    it('should not require class instantiation', () => {
      // Should not throw when accessing static method
      expect(() => GeminiService.generateContent).not.toThrow();
    });

    it('should maintain consistent behavior across calls', async () => {
      const mockResponse = { consistent: true };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse)
      } as any);

      const result1 = await GeminiService.generateContent('test1');
      const result2 = await GeminiService.generateContent('test2');

      expect(result1).toEqual(mockResponse);
      expect(result2).toEqual(mockResponse);
    });
  });
});