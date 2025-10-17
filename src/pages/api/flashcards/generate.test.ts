import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './generate';
import { OpenRouterService } from '../../../lib/services/openRouterService';
import type { StructuredResponse } from '../../../lib/services/openRouterService';

// ===================================================================
// MOCK SETUP
// ===================================================================

// Mock OpenRouterService at the top level
vi.mock('../../../lib/services/openRouterService', () => ({
  OpenRouterService: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public readonly status: number, public readonly responseBody: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
  ApiConnectionError: class ApiConnectionError extends Error {
    constructor(message: string, public readonly originalError: Error) {
      super(message);
      this.name = 'ApiConnectionError';
    }
  },
  InvalidResponseError: class InvalidResponseError extends Error {
    constructor(message: string, public readonly responseData?: any) {
      super(message);
      this.name = 'InvalidResponseError';
    }
  },
  TimeoutError: class TimeoutError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  },
}));

// Mock Supabase client
vi.mock('../../../db/supabase.client', () => ({
  supabaseClient: {
    from: vi.fn(),
  },
}));

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Create a mock Request object for testing
 */
function createMockRequest(body: any): Request {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(),
  } as unknown as Request;
}

/**
 * Parse Response object to get JSON data
 */
async function parseResponse(response: Response) {
  const text = await response.text();
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: JSON.parse(text),
  };
}

/**
 * Create mock successful AI response
 */
function createMockAIResponse(): StructuredResponse {
  return {
    title: 'Test Flashcard Set',
    flashcards: [
      { question: 'What is TypeScript?', answer: 'A typed superset of JavaScript' },
      { question: 'What is React?', answer: 'A JavaScript library for building UIs' },
      { question: 'What is Vitest?', answer: 'A blazing fast unit test framework' },
    ],
  };
}

// ===================================================================
// TEST SUITE
// ===================================================================

describe('POST /api/flashcards/generate', () => {
  let mockGenerateFlashcards: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementation
    mockGenerateFlashcards = vi.fn();
    (OpenRouterService as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      generateFlashcards: mockGenerateFlashcards,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===================================================================
  // HAPPY PATH TESTS
  // ===================================================================

  describe('Happy Path - Successful Generation', () => {
    it('should successfully generate flashcards with valid input', async () => {
      // Arrange
      const validInput = { text: 'TypeScript is a typed superset of JavaScript.' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toBeDefined();
      expect(result.body.data.suggested_folder_name).toBe('Test Flashcard Set');
      expect(result.body.data.flashcards_proposals).toHaveLength(3);
      expect(result.body.data.flashcards_proposals[0]).toEqual({
        front: 'What is TypeScript?',
        back: 'A typed superset of JavaScript',
        generation_source: 'ai',
      });
      expect(mockGenerateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith(
        validInput.text,
        expect.any(String)
      );
    });

    it('should handle maximum allowed text length (5000 characters)', async () => {
      // Arrange
      const longText = 'a'.repeat(5000);
      const validInput = { text: longText };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith(longText, expect.any(String));
    });

    it('should trim whitespace from input text', async () => {
      // Arrange
      const inputWithWhitespace = { text: '  \n\t  Valid text with whitespace  \n\t  ' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(inputWithWhitespace);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith(
        'Valid text with whitespace',
        expect.any(String)
      );
    });

    it('should use custom model name from environment', async () => {
      // Arrange
      const originalEnv = import.meta.env.AI_MODELNAME;
      import.meta.env.AI_MODELNAME = 'openai/gpt-4o';
      
      const validInput = { text: 'Test text' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      await parseResponse(response);

      // Assert
      expect(mockGenerateFlashcards).toHaveBeenCalledWith('Test text', 'openai/gpt-4o');

      // Cleanup
      import.meta.env.AI_MODELNAME = originalEnv;
    });

    it('should use default model name when not in environment', async () => {
      // Arrange
      const originalEnv = import.meta.env.AI_MODELNAME;
      import.meta.env.AI_MODELNAME = '';
      
      const validInput = { text: 'Test text' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      await parseResponse(response);

      // Assert
      expect(mockGenerateFlashcards).toHaveBeenCalledWith('Test text', 'openai/gpt-4o-mini');

      // Cleanup
      import.meta.env.AI_MODELNAME = originalEnv;
    });

    it('should set correct response headers', async () => {
      // Arrange
      const validInput = { text: 'Test text' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.headers['content-type']).toBe('application/json');
      expect(result.headers['cache-control']).toBe('no-cache');
    });
  });

  // ===================================================================
  // VALIDATION ERROR TESTS
  // ===================================================================

  describe('Validation Errors - Input Validation', () => {
    it('should reject empty text', async () => {
      // Arrange
      const invalidInput = { text: '' };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(result.body.message).toContain('Text cannot be empty');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should reject whitespace-only text', async () => {
      // NOTE: This test is skipped because of a known bug in the Zod schema order
      // Current schema: .min(1).max(5000).trim() validates BEFORE trimming
      // Should be: .trim().min(1).max(5000) to validate AFTER trimming
      // TODO: Fix the schema order in generate.ts and enable this test
      
      // Arrange - Zod schema with trim() will convert whitespace-only to empty string
      const invalidInput = { text: '   \n\t   ' };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert - Zod's min(1) validation after trim() should catch this
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(result.body.message).toContain('Text cannot be empty');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should reject text exceeding 5000 characters', async () => {
      // Arrange
      const tooLongText = 'a'.repeat(5001);
      const invalidInput = { text: tooLongText };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(result.body.message).toContain('Text cannot exceed 5000 characters');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should reject missing text field', async () => {
      // Arrange
      const invalidInput = {};
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should reject non-string text field', async () => {
      // Arrange
      const invalidInput = { text: 12345 };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should provide detailed validation errors', async () => {
      // Arrange
      const invalidInput = { text: '' };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.details).toBeDefined();
      expect(Array.isArray(result.body.details)).toBe(true);
      expect(result.body.details.length).toBeGreaterThan(0);
      expect(result.body.details[0]).toHaveProperty('path');
      expect(result.body.details[0]).toHaveProperty('message');
    });
  });

  // ===================================================================
  // MALFORMED REQUEST TESTS
  // ===================================================================

  describe('Malformed Requests', () => {
    it('should handle invalid JSON in request body', async () => {
      // Arrange
      const request = {
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        headers: new Headers(),
      } as unknown as Request;

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Invalid request body');
      expect(result.body.message).toContain('Failed to parse JSON');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should handle null request body', async () => {
      // Arrange
      const request = {
        json: vi.fn().mockResolvedValue(null),
        headers: new Headers(),
      } as unknown as Request;

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should handle unexpected request body structure', async () => {
      // Arrange
      const invalidInput = { wrongField: 'value' };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // OPENROUTER SERVICE ERROR TESTS
  // ===================================================================

  describe('OpenRouter Service Errors', () => {
    it('should handle missing API key configuration', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(
        new Error('OPENROUTER_API_KEY is not set in environment variables.')
      );

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Configuration error');
      expect(result.body.message).toContain('Service is not properly configured');
    });

    it('should handle empty prompt validation error', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(new Error('Prompt cannot be empty'));

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation error');
      expect(result.body.message).toBe('Prompt cannot be empty');
    });

    it('should handle empty model name validation error', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(new Error('Model name cannot be empty'));

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation error');
      expect(result.body.message).toBe('Model name cannot be empty');
    });

    it('should handle API connection errors', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(
        new Error('Failed to connect to OpenRouter API')
      );

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
      expect(result.body.message).toContain('Failed to connect to OpenRouter API');
    });

    it('should handle timeout errors', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(new Error('Request timed out after 30 seconds.'));

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
      expect(result.body.message).toContain('timed out');
    });

    it('should handle invalid API response structure', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(
        new Error('Invalid API response structure: no choices found.')
      );

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
    });

    it('should handle generic service errors', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue(new Error('Unexpected service error'));

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
      expect(result.body.message).toBe('Unexpected service error');
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      mockGenerateFlashcards.mockRejectedValue('String error instead of Error object');

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Internal server error');
      expect(result.body.message).toBe('Unknown error occurred');
    });
  });

  // ===================================================================
  // RESPONSE TRANSFORMATION TESTS
  // ===================================================================

  describe('Response Transformation', () => {
    it('should correctly transform AI response to API response format', async () => {
      // Arrange
      const mockAIResponse: StructuredResponse = {
        title: 'JavaScript Basics',
        flashcards: [
          { question: 'What is a variable?', answer: 'A container for storing data values' },
          { question: 'What is a function?', answer: 'A reusable block of code' },
        ],
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const validInput = { text: 'Learn JavaScript' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.suggested_folder_name).toBe('JavaScript Basics');
      expect(result.body.data.flashcards_proposals).toHaveLength(2);
      expect(result.body.data.flashcards_proposals[0]).toEqual({
        front: 'What is a variable?',
        back: 'A container for storing data values',
        generation_source: 'ai',
      });
      expect(result.body.data.flashcards_proposals[1]).toEqual({
        front: 'What is a function?',
        back: 'A reusable block of code',
        generation_source: 'ai',
      });
    });

    it('should handle AI response with single flashcard', async () => {
      // Arrange
      const mockAIResponse: StructuredResponse = {
        title: 'Single Concept',
        flashcards: [{ question: 'What is AI?', answer: 'Artificial Intelligence' }],
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const validInput = { text: 'Test' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.flashcards_proposals).toHaveLength(1);
      expect(result.body.data.flashcards_proposals[0].generation_source).toBe('ai');
    });

    it('should handle AI response with maximum flashcards', async () => {
      // Arrange
      const maxFlashcards = Array.from({ length: 15 }, (_, i) => ({
        question: `Question ${i + 1}`,
        answer: `Answer ${i + 1}`,
      }));
      const mockAIResponse: StructuredResponse = {
        title: 'Large Set',
        flashcards: maxFlashcards,
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const validInput = { text: 'Large text for many flashcards' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.flashcards_proposals).toHaveLength(15);
      expect(result.body.data.flashcards_proposals.every((f: any) => f.generation_source === 'ai')).toBe(true);
    });

    it('should preserve special characters in flashcard content', async () => {
      // Arrange
      const mockAIResponse: StructuredResponse = {
        title: 'Special Characters: <>& "Test"',
        flashcards: [
          {
            question: 'What is <div> & "quotes"?',
            answer: 'HTML element with special chars: <>&"',
          },
        ],
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const validInput = { text: 'Test with special characters' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.suggested_folder_name).toContain('<>& "Test"');
      expect(result.body.data.flashcards_proposals[0].front).toContain('<div> & "quotes"');
      expect(result.body.data.flashcards_proposals[0].back).toContain('<>&"');
    });

    it('should preserve unicode characters in flashcard content', async () => {
      // Arrange
      const mockAIResponse: StructuredResponse = {
        title: 'Nauka Polskiego 🇵🇱',
        flashcards: [
          { question: 'Co to jest ąćęłńóśźż?', answer: 'Polski alfabet 😊' },
        ],
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const validInput = { text: 'Nauka języka polskiego' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.suggested_folder_name).toContain('🇵🇱');
      expect(result.body.data.flashcards_proposals[0].front).toContain('ąćęłńóśźż');
      expect(result.body.data.flashcards_proposals[0].back).toContain('😊');
    });
  });

  // ===================================================================
  // EDGE CASES TESTS
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle text with exactly 5000 characters', async () => {
      // Arrange
      const exactLengthText = 'a'.repeat(5000);
      const validInput = { text: exactLengthText };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
    });

    it('should handle text with exactly 1 character', async () => {
      // Arrange
      const minimalText = 'a';
      const validInput = { text: minimalText };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
    });

    it('should handle text with only newlines and spaces after trim', async () => {
      // NOTE: This test is skipped because of a known bug in the Zod schema order
      // Current schema: .min(1).max(5000).trim() validates BEFORE trimming
      // Should be: .trim().min(1).max(5000) to validate AFTER trimming
      // TODO: Fix the schema order in generate.ts and enable this test
      
      // Arrange - Should be rejected by Zod schema after trim
      const invalidInput = { text: '\n\n   \n\n' };
      const request = createMockRequest(invalidInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert - After trim, this becomes empty and should be rejected by min(1) validation
      expect(result.status).toBe(400);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Validation failed');
      expect(result.body.message).toContain('Text cannot be empty');
      expect(mockGenerateFlashcards).not.toHaveBeenCalled();
    });

    it('should handle text with mixed whitespace characters', async () => {
      // Arrange
      const textWithMixedWhitespace = '  \t\n  Valid content  \r\n\t  ';
      const validInput = { text: textWithMixedWhitespace };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith('Valid content', expect.any(String));
    });

    it('should handle text with multiple consecutive spaces', async () => {
      // Arrange
      const textWithSpaces = 'Text    with     many      spaces';
      const validInput = { text: textWithSpaces };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(200);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith(
        textWithSpaces,
        expect.any(String)
      );
    });
  });

  // ===================================================================
  // SERVICE INSTANTIATION TESTS
  // ===================================================================

  describe('Service Instantiation', () => {
    it('should create new OpenRouterService instance for each request', async () => {
      // Arrange
      const validInput = { text: 'Test text' };
      const mockAIResponse = createMockAIResponse();
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request1 = createMockRequest(validInput);
      const request2 = createMockRequest(validInput);

      // Act
      await POST({ request: request1 } as any);
      await POST({ request: request2 } as any);

      // Assert
      expect(OpenRouterService).toHaveBeenCalledTimes(2);
    });

    it('should handle OpenRouterService constructor errors', async () => {
      // Arrange
      (OpenRouterService as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
      });

      const validInput = { text: 'Test text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error).toBe('Configuration error');
    });
  });

  // ===================================================================
  // INTEGRATION-LIKE TESTS
  // ===================================================================

  describe('Integration-like Scenarios', () => {
    it('should handle complete flow from request to response', async () => {
      // Arrange
      const userText = 'Learn TypeScript: static typing, interfaces, and generics.';
      const validInput = { text: userText };
      
      const mockAIResponse: StructuredResponse = {
        title: 'TypeScript Fundamentals',
        flashcards: [
          { question: 'What is static typing?', answer: 'Type checking at compile time' },
          { question: 'What are interfaces?', answer: 'Contracts for object shapes' },
          { question: 'What are generics?', answer: 'Reusable type-safe components' },
        ],
      };
      mockGenerateFlashcards.mockResolvedValue(mockAIResponse);

      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert - Request processing
      expect(OpenRouterService).toHaveBeenCalledTimes(1);
      expect(mockGenerateFlashcards).toHaveBeenCalledWith(
        userText,
        expect.any(String)
      );

      // Assert - Response structure
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        success: true,
        data: {
          suggested_folder_name: 'TypeScript Fundamentals',
          flashcards_proposals: [
            {
              front: 'What is static typing?',
              back: 'Type checking at compile time',
              generation_source: 'ai',
            },
            {
              front: 'What are interfaces?',
              back: 'Contracts for object shapes',
              generation_source: 'ai',
            },
            {
              front: 'What are generics?',
              back: 'Reusable type-safe components',
              generation_source: 'ai',
            },
          ],
        },
      });

      // Assert - Response headers
      expect(result.headers['content-type']).toBe('application/json');
      expect(result.headers['cache-control']).toBe('no-cache');
    });

    it('should maintain data integrity through transformation pipeline', async () => {
      // Arrange
      const testData = {
        title: 'Test Title with "quotes" & <tags>',
        flashcards: [
          {
            question: 'Q with émojis 🎉 & spëcial chars',
            answer: 'A with <html> & "nested quotes"',
          },
        ],
      };
      mockGenerateFlashcards.mockResolvedValue(testData);

      const validInput = { text: 'Complex text' };
      const request = createMockRequest(validInput);

      // Act
      const response = await POST({ request } as any);
      const result = await parseResponse(response);

      // Assert
      expect(result.body.data.suggested_folder_name).toBe(testData.title);
      expect(result.body.data.flashcards_proposals[0].front).toBe(testData.flashcards[0].question);
      expect(result.body.data.flashcards_proposals[0].back).toBe(testData.flashcards[0].answer);
    });
  });
});
