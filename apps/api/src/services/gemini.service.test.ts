import { GeminiService } from './gemini.service';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('GeminiService', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateContent', () => {
    const mockPrompt = 'Test prompt for content generation';
    const mockApiKey = 'test-api-key-123';
    const mockSuccessResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Generated content response' }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0
        }
      ]
    };

    beforeEach(() => {
      process.env.GEMINI_API_KEY = mockApiKey;
    });

    describe('Happy Path Scenarios', () => {
      it('should successfully generate content with valid prompt', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${mockApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: mockPrompt }] }]
            })
          }
        );
      });

      it('should handle empty string prompt', async () => {
        // Arrange
        const emptyPrompt = '';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(emptyPrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: emptyPrompt }] }]
            })
          })
        );
      });

      it('should handle very long prompts', async () => {
        // Arrange
        const longPrompt = 'a'.repeat(10000);
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(longPrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: longPrompt }] }]
            })
          })
        );
      });

      it('should handle prompts with special characters', async () => {
        // Arrange
        const specialCharPrompt = 'Test with émojis 🚀 and symbols @#$%^&*()';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(specialCharPrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: specialCharPrompt }] }]
            })
          })
        );
      });
    });

    describe('Environment Variable Validation', () => {
      it('should throw error when GEMINI_API_KEY is not set', async () => {
        // Arrange
        delete process.env.GEMINI_API_KEY;

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('GEMINI_API_KEY is not defined.');
        
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error when GEMINI_API_KEY is empty string', async () => {
        // Arrange
        process.env.GEMINI_API_KEY = '';

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('GEMINI_API_KEY is not defined.');
        
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error when GEMINI_API_KEY is undefined', async () => {
        // Arrange
        process.env.GEMINI_API_KEY = undefined;

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('GEMINI_API_KEY is not defined.');
        
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('HTTP Error Handling', () => {
      it('should throw error on 400 Bad Request', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('Bad Request: Invalid prompt format')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 400: Bad Request: Invalid prompt format');
      });

      it('should throw error on 401 Unauthorized', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('Unauthorized: Invalid API key')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 401: Unauthorized: Invalid API key');
      });

      it('should throw error on 403 Forbidden', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 403,
          text: jest.fn().mockResolvedValue('Forbidden: API quota exceeded')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 403: Forbidden: API quota exceeded');
      });

      it('should throw error on 429 Rate Limited', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 429,
          text: jest.fn().mockResolvedValue('Too Many Requests: Rate limit exceeded')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 429: Too Many Requests: Rate limit exceeded');
      });

      it('should throw error on 500 Internal Server Error', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValue('Internal Server Error')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 500: Internal Server Error');
      });

      it('should handle error response with empty error text', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValue('')
        };
        mockFetch.mockResolvedValue(mockErrorResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Gemini API request failed with status 500: ');
      });
    });

    describe('Network Error Handling', () => {
      it('should handle network timeout errors', async () => {
        // Arrange
        mockFetch.mockRejectedValue(new Error('Network timeout'));

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Network timeout');
      });

      it('should handle connection refused errors', async () => {
        // Arrange
        mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('ECONNREFUSED');
      });

      it('should handle DNS resolution errors', async () => {
        // Arrange
        mockFetch.mockRejectedValue(new Error('ENOTFOUND'));

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('ENOTFOUND');
      });
    });

    describe('Response Parsing Edge Cases', () => {
      it('should handle malformed JSON response', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt))
          .rejects
          .toThrow('Unexpected token');
      });

      it('should handle null response body', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(null)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(result).toBeNull();
      });

      it('should handle undefined response body', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(undefined)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('API Request Structure Validation', () => {
      it('should construct correct API URL with API key', async () => {
        // Arrange
        const customApiKey = 'custom-test-key-456';
        process.env.GEMINI_API_KEY = customApiKey;
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${customApiKey}`,
          expect.any(Object)
        );
      });

      it('should send correct headers', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });

      it('should send correct payload structure', async () => {
        // Arrange
        const testPrompt = 'Custom test prompt';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        await GeminiService.generateContent(testPrompt);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: testPrompt }] }]
            })
          })
        );
      });
    });

    describe('Edge Cases and Boundary Conditions', () => {
      it('should handle whitespace-only prompts', async () => {
        // Arrange
        const whitespacePrompt = '   \n\t   ';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(whitespacePrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: whitespacePrompt }] }]
            })
          })
        );
      });

      it('should handle prompts with newlines and tabs', async () => {
        // Arrange
        const multilinePrompt = 'Line 1\nLine 2\n\tIndented line';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(multilinePrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: multilinePrompt }] }]
            })
          })
        );
      });

      it('should handle Unicode characters in prompts', async () => {
        // Arrange
        const unicodePrompt = 'こんにちは 🌟 Привет العربية';
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(unicodePrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: unicodePrompt }] }]
            })
          })
        );
      });
    });

    describe('Method Call Verification', () => {
      it('should call fetch exactly once per method call', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should call response.json() exactly once per method call', async () => {
        // Arrange
        const mockJsonFn = jest.fn().mockResolvedValue(mockSuccessResponse);
        const mockResponse = {
          ok: true,
          status: 200,
          json: mockJsonFn
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(mockJsonFn).toHaveBeenCalledTimes(1);
      });

      it('should call response.text() exactly once when error occurs', async () => {
        // Arrange
        const mockTextFn = jest.fn().mockResolvedValue('Error message');
        const mockResponse = {
          ok: false,
          status: 400,
          text: mockTextFn
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act & Assert
        await expect(GeminiService.generateContent(mockPrompt)).rejects.toThrow();
        expect(mockTextFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('Static Method Behavior', () => {
      it('should be callable as a static method', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act & Assert
        expect(typeof GeminiService.generateContent).toBe('function');
        const result = await GeminiService.generateContent(mockPrompt);
        expect(result).toEqual(mockSuccessResponse);
      });

      it('should not require class instantiation', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse)
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        // Act
        const result = await GeminiService.generateContent(mockPrompt);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
        // Verify no instance was needed
        expect(GeminiService).toBeInstanceOf(Function);
      });
    });
  });
});