/**
 * OpenRouter Service - serwis do komunikacji z API OpenRouter.ai
 * Odpowiedzialny za generowanie fiszek przy użyciu modeli językowych (LLM)
 */

// ===================================================================
// TYPY I INTERFEJSY
// ===================================================================

/**
 * Interfejs reprezentujący pojedynczą fiszkę wygenerowaną przez AI
 */
export interface Flashcard {
  question: string;
  answer: string;
}

/**
 * Interfejs reprezentujący ustrukturyzowaną odpowiedź z API OpenRouter
 */
export interface StructuredResponse {
  flashcards: Flashcard[];
  title: string;
}

/**
 * Interfejs dla błędów związanych z API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Interfejs dla błędów związanych z połączeniem
 */
export class ApiConnectionError extends Error {
  constructor(message: string, public readonly originalError: Error) {
    super(message);
    this.name = 'ApiConnectionError';
  }
}

/**
 * Interfejs dla błędów związanych z parsowaniem odpowiedzi
 */
export class InvalidResponseError extends Error {
  constructor(message: string, public readonly responseData?: any) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

/**
 * Interfejs dla błędów związanych z timeout
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ===================================================================
// KLASA SERWISU
// ===================================================================

/**
 * OpenRouterService - główna klasa serwisu do komunikacji z OpenRouter API
 * 
 * Responsibilities:
 * - Zarządzanie konfiguracją API (klucz, endpoint)
 * - Wysyłanie zapytań do modeli językowych
 * - Parsowanie i walidacja odpowiedzi
 * - Obsługa błędów i timeout
 */
export class OpenRouterService {
  private readonly openRouterApiKey: string;
  private readonly openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
  private readonly requestTimeout = 30000; // 30 sekund

  /**
   * Konstruktor serwisu OpenRouter
   * Inicjalizuje klucz API i waliduje konfigurację
   * 
   * @throws {Error} Jeśli klucz API nie jest dostępny w zmiennych środowiskowych
   */
  constructor() {
    // Wczytanie klucza API ze zmiennych środowiskowych
    // Zgodnie z dokumentacją Astro, używamy `import.meta.env`
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Rzucenie błędu, jeśli klucz API nie jest dostępny
      throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
    }
    
    this.openRouterApiKey = apiKey;
  }

  /**
   * Główna metoda publiczna do generowania fiszek
   * 
   * @param prompt - Tekst wejściowy od użytkownika, na podstawie którego generowane będą fiszki
   * @param modelName - Nazwa modelu do użycia (np. "anthropic/claude-3.5-sonnet")
   * @returns Promise<StructuredResponse> - Obiekt zawierający wygenerowane fiszki i tytuł
   * 
   * @throws {ApiError} Błędy związane z API (4xx, 5xx)
   * @throws {ApiConnectionError} Błędy połączenia sieciowego
   * @throws {InvalidResponseError} Błędy parsowania odpowiedzi
   * @throws {TimeoutError} Błędy timeout
   */
  public async generateFlashcards(prompt: string, modelName: string): Promise<StructuredResponse> {
    // Walidacja parametrów wejściowych
    if (!prompt?.trim()) {
      throw new Error("Prompt cannot be empty");
    }
    
    if (!modelName?.trim()) {
      throw new Error("Model name cannot be empty");
    }

    // Definicja komunikatu systemowego w języku polskim
    const systemMessage = `Jesteś ekspertem w tworzeniu fiszek do nauki. Twoim zadaniem jest wygenerowanie zestawu fiszek na podstawie dostarczonego tekstu. 

Zasady tworzenia fiszek:
1. Każda fiszka powinna zawierać konkretne pytanie i jasną odpowiedź
2. Pytania powinny być zróżnicowane (definicje, przykłady, zastosowania, porównania)
3. Odpowiedzi powinny być zwięzłe ale kompletne
4. Unikaj powtarzania tych samych informacji w różnych fiszkach
5. Skoncentruj się na najważniejszych pojęciach z podanego tekstu

Odpowiedź musi być w formacie JSON zgodnym z podanym schematem.`;
    
    // Definicja schematu JSON dla structured output
    const responseFormat = {
      type: 'json_schema',
      json_schema: {
        name: 'flashcardSet',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: { 
              type: 'string', 
              description: 'Tytuł zestawu fiszek, powiązany z głównym tematem podanego tekstu. Maksymalnie 50 znaków.' 
            },
            flashcards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { 
                    type: 'string', 
                    description: 'Pytanie na fiszce. Powinno być jasne i konkretne.' 
                  },
                  answer: { 
                    type: 'string', 
                    description: 'Odpowiedź na fiszce. Powinna być zwięzła ale kompletna.' 
                  }
                },
                required: ['question', 'answer'],
                additionalProperties: false
              },
              minItems: 3,
              maxItems: 15,
              description: 'Lista fiszek wygenerowanych na podstawie podanego tekstu.'
            }
          },
          required: ['title', 'flashcards'],
          additionalProperties: false
        }
      }
    };

    // Budowanie payloadu zapytania
    const payload = this.buildRequestPayload(systemMessage, prompt, modelName, responseFormat);
    
    // Wysłanie zapytania do API
    const apiResponse = await this.sendRequest(payload);
    
    // Parsowanie i walidacja odpowiedzi
    return this.parseAndValidateResponse(apiResponse);
  }

  // ===================================================================
  // METODY PRYWATNE
  // ===================================================================

  /**
   * Buduje payload zapytania do API OpenRouter
   * 
   * @param systemMessage - Komunikat systemowy definiujący rolę i zasady
   * @param userMessage - Wiadomość użytkownika (prompt)
   * @param modelName - Nazwa modelu do użycia
   * @param responseFormat - Format odpowiedzi (JSON schema)
   * @returns Obiekt payload do wysłania
   */
  private buildRequestPayload(
    systemMessage: string, 
    userMessage: string, 
    modelName: string, 
    responseFormat: object
  ): object {
    return {
      model: modelName,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      response_format: responseFormat,
      temperature: 0.7, // Balans między kreatywnością a spójnością
      max_tokens: 4000, // Limit tokenów dla odpowiedzi
    };
  }

  /**
   * Wysyła zapytanie POST do API OpenRouter
   * 
   * @param payload - Obiekt danych do wysłania
   * @returns Promise<any> - Surowa odpowiedź z API
   * 
   * @throws {TimeoutError} Jeśli zapytanie przekroczy timeout
   * @throws {ApiError} Jeśli API zwróci błąd (4xx, 5xx)
   * @throws {ApiConnectionError} Jeśli wystąpi błąd połączenia
   */
  private async sendRequest(payload: object): Promise<any> {
    // Konfiguracja AbortController dla timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(this.openRouterApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://10x-cards-flipper.com', // Opcjonalne dla statystyk
          'X-Title': '10x Cards Flipper', // Opcjonalne dla statystyk
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Obsługa błędów HTTP
      if (!response.ok) {
        const errorBody = await response.text();
        
        // Logowanie błędu dla debugowania (bez wrażliwych danych)
        console.error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
        
        throw new ApiError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return await response.json();
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Obsługa różnych typów błędów
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${this.requestTimeout / 1000} seconds.`);
      }
      
      // Jeśli to już nasz custom error, przekaż dalej
      if (error instanceof ApiError || error instanceof TimeoutError) {
        throw error;
      }
      
      // Błędy połączenia sieciowego
      throw new ApiConnectionError(
        'Failed to connect to OpenRouter API. Please check your internet connection.',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Parsuje i waliduje odpowiedź z API OpenRouter
   * 
   * @param apiResponse - Surowa odpowiedź z API
   * @returns StructuredResponse - Sparsowana i zwalidowana odpowiedź
   * 
   * @throws {InvalidResponseError} Jeśli odpowiedź ma niepoprawną strukturę lub zawartość
   */
  private parseAndValidateResponse(apiResponse: any): StructuredResponse {
    try {
      // Sprawdzenie podstawowej struktury odpowiedzi
      if (!apiResponse?.choices?.length) {
        throw new InvalidResponseError('Invalid API response structure: no choices found.', apiResponse);
      }

      const content = apiResponse.choices[0]?.message?.content;
      if (!content) {
        throw new InvalidResponseError('Invalid API response structure: content is missing.', apiResponse);
      }
      
      // Parsowanie JSON
      let parsedContent: StructuredResponse;
      try {
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        throw new InvalidResponseError('Failed to parse JSON content from API response.', { content, jsonError });
      }

      // Walidacja struktury odpowiedzi
      if (!parsedContent || typeof parsedContent !== 'object') {
        throw new InvalidResponseError('Parsed content is not a valid object.', parsedContent);
      }

      if (!parsedContent.title || typeof parsedContent.title !== 'string') {
        throw new InvalidResponseError('Validation failed: title is missing or invalid.', parsedContent);
      }

      if (!Array.isArray(parsedContent.flashcards)) {
        throw new InvalidResponseError('Validation failed: flashcards should be an array.', parsedContent);
      }

      // Walidacja każdej fiszki
      for (let i = 0; i < parsedContent.flashcards.length; i++) {
        const flashcard = parsedContent.flashcards[i];
        
        if (!flashcard || typeof flashcard !== 'object') {
          throw new InvalidResponseError(`Validation failed: flashcard at index ${i} is not a valid object.`, parsedContent);
        }
        
        if (!flashcard.question || typeof flashcard.question !== 'string') {
          throw new InvalidResponseError(`Validation failed: flashcard at index ${i} has missing or invalid question.`, parsedContent);
        }
        
        if (!flashcard.answer || typeof flashcard.answer !== 'string') {
          throw new InvalidResponseError(`Validation failed: flashcard at index ${i} has missing or invalid answer.`, parsedContent);
        }
      }

      // Sprawdzenie czy jest przynajmniej jedna fiszka
      if (parsedContent.flashcards.length === 0) {
        throw new InvalidResponseError('Validation failed: no flashcards generated.', parsedContent);
      }

      return parsedContent;
      
    } catch (error) {
      // Logowanie błędu parsowania (bez wrażliwych danych)
      console.error("Failed to parse or validate API response:", error instanceof Error ? error.message : String(error));
      
      // Jeśli to już nasz custom error, przekaż dalej
      if (error instanceof InvalidResponseError) {
        throw error;
      }
      
      // Inne nieoczekiwane błędy
      throw new InvalidResponseError(
        'Failed to process API response due to unexpected error.', 
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}