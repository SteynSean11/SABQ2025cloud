import { Request, Response } from 'express';
import { GeminiController } from './gemini.controller';
import { GeminiService } from '../services/gemini.service';

// Mock the GeminiService
jest.mock('../services/gemini.service');

describe('GeminiController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockGeminiService: jest.Mocked<typeof GeminiService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock GeminiService
    mockGeminiService = GeminiService as jest.Mocked<typeof GeminiService>;
    
    // Setup mock request and response objects
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Mock console.error to avoid noise in test output and verify error logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('generateContent', () => {
    describe('successful content generation', () => {
      it('should successfully generate content with valid prompt', async () => {
        // Arrange
        const prompt = 'Write a story about artificial intelligence';
        const expectedResult = {
          content: 'Once upon a time, there was an AI that dreamed of electric sheep...',
          model: 'gemini-1.5-pro',
          tokenCount: 150,
        };

        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(mockGeminiService.generateContent).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should handle empty string prompt as valid input', async () => {
        // Arrange
        const prompt = '';
        mockRequest.body = { prompt };

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
        expect(mockGeminiService.generateContent).not.toHaveBeenCalled();
      });

      it('should handle prompts with special characters', async () => {
        // Arrange
        const prompt = 'Generate text with émojis 🚀, symbols @#$%, and newlines\n\nLike this!';
        const expectedResult = {
          content: 'Generated content with special characters...',
          model: 'gemini-1.5-flash',
        };

        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should handle very long prompts', async () => {
        // Arrange
        const longPrompt = 'A'.repeat(10000); // 10KB prompt
        const expectedResult = {
          content: 'Generated response for long prompt...',
          tokenCount: 2500,
        };

        mockRequest.body = { prompt: longPrompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(longPrompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should handle numeric prompt values', async () => {
        // Arrange
        const numericPrompt = 12345;
        const expectedResult = { content: 'Processed numeric input' };

        mockRequest.body = { prompt: numericPrompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(numericPrompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });
    });

    describe('validation and error cases', () => {
      it('should return 400 when prompt is missing from request body', async () => {
        // Arrange
        mockRequest.body = {};

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
        expect(mockGeminiService.generateContent).not.toHaveBeenCalled();
      });

      it('should return 400 when prompt is null', async () => {
        // Arrange
        mockRequest.body = { prompt: null };

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
        expect(mockGeminiService.generateContent).not.toHaveBeenCalled();
      });

      it('should return 400 when prompt is undefined', async () => {
        // Arrange
        mockRequest.body = { prompt: undefined };

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
        expect(mockGeminiService.generateContent).not.toHaveBeenCalled();
      });

      it('should return 400 when request body is entirely missing', async () => {
        // Arrange
        mockRequest.body = undefined;

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
        expect(mockGeminiService.generateContent).not.toHaveBeenCalled();
      });

      it('should accept zero as a valid prompt (falsy but not null/undefined)', async () => {
        // Arrange
        const prompt = 0;
        const expectedResult = { content: 'Processed zero input' };

        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should accept boolean false as a valid prompt', async () => {
        // Arrange
        const prompt = false;
        const expectedResult = { content: 'Processed boolean input' };

        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });
    });

    describe('service error handling', () => {
      it('should handle generic service errors and return 500', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const serviceError = new Error('Service unavailable');
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockRejectedValue(serviceError);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', serviceError);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });

      it('should handle API quota exceeded errors', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const quotaError = new Error('Quota exceeded');
        quotaError.name = 'QuotaExceededError';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockRejectedValue(quotaError);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', quotaError);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });

      it('should handle network timeout errors', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockRejectedValue(timeoutError);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', timeoutError);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });

      it('should handle authentication errors', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const authError = new Error('Invalid API key');
        authError.name = 'AuthenticationError';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockRejectedValue(authError);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', authError);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });

      it('should handle service returning null/undefined', async () => {
        // Arrange
        const prompt = 'Test prompt';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(null as any);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(null);
      });

      it('should handle service throwing non-Error objects', async () => {
        // Arrange
        const prompt = 'Test prompt';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockRejectedValue('String error');

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in GeminiController:', 'String error');
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });
    });

    describe('edge cases and performance', () => {
      it('should handle concurrent requests independently', async () => {
        // Arrange
        const requests = [
          { body: { prompt: 'Prompt 1' } },
          { body: { prompt: 'Prompt 2' } },
          { body: { prompt: 'Prompt 3' } },
        ];
        
        const responses = requests.map(() => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }));

        const expectedResults = [
          { content: 'Response 1' },
          { content: 'Response 2' },
          { content: 'Response 3' },
        ];

        mockGeminiService.generateContent
          .mockResolvedValueOnce(expectedResults[0])
          .mockResolvedValueOnce(expectedResults[1])
          .mockResolvedValueOnce(expectedResults[2]);

        // Act
        const promises = requests.map((req, i) =>
          GeminiController.generateContent(req as Request, responses[i] as Response)
        );
        await Promise.all(promises);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledTimes(3);
        expect(mockGeminiService.generateContent).toHaveBeenNthCalledWith(1, 'Prompt 1');
        expect(mockGeminiService.generateContent).toHaveBeenNthCalledWith(2, 'Prompt 2');
        expect(mockGeminiService.generateContent).toHaveBeenNthCalledWith(3, 'Prompt 3');
        
        responses.forEach((response, i) => {
          expect(response.status).toHaveBeenCalledWith(200);
          expect(response.json).toHaveBeenCalledWith(expectedResults[i]);
        });
      });

      it('should handle mixed success and failure in concurrent requests', async () => {
        // Arrange
        const requests = [
          { body: { prompt: 'Success prompt' } },
          { body: { prompt: 'Failure prompt' } },
        ];
        
        const responses = requests.map(() => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }));

        mockGeminiService.generateContent
          .mockResolvedValueOnce({ content: 'Success response' })
          .mockRejectedValueOnce(new Error('Service error'));

        // Act
        const promises = requests.map((req, i) =>
          GeminiController.generateContent(req as Request, responses[i] as Response)
        );
        await Promise.all(promises);

        // Assert
        expect(responses[0].status).toHaveBeenCalledWith(200);
        expect(responses[0].json).toHaveBeenCalledWith({ content: 'Success response' });
        expect(responses[1].status).toHaveBeenCalledWith(500);
        expect(responses[1].json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });

      it('should handle requests with additional body parameters (ignoring them)', async () => {
        // Arrange
        const prompt = 'Test prompt';
        mockRequest.body = {
          prompt,
          temperature: 0.7,
          maxTokens: 1000,
          model: 'gemini-1.5-pro',
          extraParam: 'should be ignored',
        };
        const expectedResult = { content: 'Generated content' };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(prompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should handle requests with nested objects in prompt', async () => {
        // Arrange
        const complexPrompt = {
          text: 'Generate content',
          context: { topic: 'AI', style: 'formal' },
        };
        mockRequest.body = { prompt: complexPrompt };
        const expectedResult = { content: 'Complex prompt response' };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(complexPrompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });

      it('should handle array prompts', async () => {
        // Arrange
        const arrayPrompt = ['Generate', 'multiple', 'responses'];
        mockRequest.body = { prompt: arrayPrompt };
        const expectedResult = { content: 'Array prompt response' };
        mockGeminiService.generateContent.mockResolvedValue(expectedResult);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockGeminiService.generateContent).toHaveBeenCalledWith(arrayPrompt);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      });
    });

    describe('response validation', () => {
      it('should pass through service response exactly as received', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const serviceResponse = {
          content: 'Generated content',
          metadata: {
            model: 'gemini-1.5-pro',
            tokenCount: 150,
            finishReason: 'STOP',
          },
          citations: [
            { source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/AI' },
          ],
        };
        
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(serviceResponse);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
      });

      it('should handle empty service responses', async () => {
        // Arrange
        const prompt = 'Test prompt';
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue({});

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({});
      });

      it('should handle service responses with circular references', async () => {
        // Arrange
        const prompt = 'Test prompt';
        const circularObj: any = { content: 'Response' };
        circularObj.self = circularObj; // Create circular reference
        
        mockRequest.body = { prompt };
        mockGeminiService.generateContent.mockResolvedValue(circularObj);

        // Act
        await GeminiController.generateContent(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(circularObj);
      });
    });
  });
});