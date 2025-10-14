# Przewodnik Implementacji Usługi OpenRouter

Ten dokument opisuje szczegółowy plan wdrożenia usługi `OpenRouterService` w projekcie, zgodnie z przyjętym stosem technologicznym i najlepszymi praktykami.

## 1. Opis usługi

`OpenRouterService` będzie stanowić centralny punkt integracji z API OpenRouter.ai. Jego zadaniem jest hermetyzacja logiki związanej z wysyłaniem zapytań do modeli językowych (LLM), zarządzaniem konfiguracją oraz obsługą odpowiedzi i błędów. Usługa zostanie zaimplementowana jako klasa w TypeScript, aby zapewnić reużywalność i łatwość testowania. Będzie ona odpowiedzialna za komunikację z zewnętrznym API, co pozwoli na generowanie treści, np. fiszek, na podstawie danych wejściowych od użytkownika.

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` będzie odpowiedzialny za inicjalizację usługi. Jego głównym zadaniem jest bezpieczne wczytanie klucza API OpenRouter z zmiennych środowiskowych. Rzucenie błędu w przypadku braku klucza API jest kluczowe dla zapewnienia, że usługa nie będzie działać w niepoprawnym stanie.

```typescript
// src/lib/services/openRouterService.ts

export class OpenRouterService {
  private readonly openRouterApiKey: string;
  private readonly openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";

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

  // ... reszta implementacji
}
```

## 3. Publiczne metody i pola

### Metody publiczne

- **`generateFlashcards(prompt: string, modelName: string): Promise<StructuredResponse>`**
  - **Opis:** Główna metoda publiczna, która przyjmuje `prompt` od użytkownika oraz `modelName` do użycia. Konstruuje i wysyła zapytanie do API OpenRouter, a następnie parsuje i zwraca ustrukturyzowaną odpowiedź.
  - **Parametry:**
    - `prompt: string` - Tekst wejściowy od użytkownika, na podstawie którego generowane będą fiszki.
    - `modelName: string` - Nazwa modelu do użycia (np. `anthropic/claude-3.5-sonnet`).
  - **Zwraca:** `Promise<StructuredResponse>` - Obiekt zawierający wygenerowane dane w zdefiniowanym formacie.

## 4. Prywatne metody i pola

### Pola prywatne

- **`openRouterApiKey: string`**
  - Przechowuje klucz API OpenRouter.
- **`openRouterApiUrl: string`**
  - Przechowuje stały adres URL punktu końcowego API OpenRouter.

### Metody prywatne

- **`buildRequestPayload(systemMessage: string, userMessage: string, modelName: string, responseFormat: object): object`**
  - **Opis:** Tworzy obiekt payloadu zapytania do API OpenRouter. Składa się z komunikatu systemowego, komunikatu użytkownika, nazwy modelu i formatu odpowiedzi.
- **`sendRequest(payload: object): Promise<any>`**
  - **Opis:** Wysyła zapytanie `POST` do API OpenRouter przy użyciu `fetch`. Dodaje nagłówki autoryzacyjne i obsługuje podstawową odpowiedź sieciową.
- **`parseAndValidateResponse(apiResponse: any): StructuredResponse`**
  - **Opis:** Przetwarza surową odpowiedź z API. Parsuje zawartość JSON z pola `choices[0].message.content` i waliduje ją względem oczekiwanego schematu.

## 5. Obsługa błędów

Obsługa błędów jest kluczowa dla stabilności usługi. Należy zaimplementować spójny mechanizm raportowania problemów.

1.  **Brak klucza API:** Konstruktor rzuci błąd `Error`, jeśli zmienna środowiskowa `OPENROUTER_API_KEY` nie jest ustawiona.
2.  **Błędy sieciowe:** Metoda `sendRequest` przechwyci błędy związane z `fetch` (np. brak połączenia z internetem) i opakuje je w dedykowany błąd, np. `ApiConnectionError`.
3.  **Błędy API (status 4xx/5xx):** Jeśli API zwróci status błędu (np. 401 - nieautoryzowany, 429 - zbyt wiele zapytań, 500 - błąd serwera), metoda `sendRequest` rzuci błąd `ApiError` zawierający status i treść odpowiedzi.
4.  **Błędy parsowania JSON:** Jeśli odpowiedź z API nie jest poprawnym JSON-em lub nie pasuje do oczekiwanego schematu, metoda `parseAndValidateResponse` rzuci błąd `InvalidResponseError`.
5.  **Timeout zapytania:** Należy zaimplementować mechanizm `AbortController` w `fetch`, aby anulować zapytanie po określonym czasie (np. 30 sekund) i rzucić błąd `TimeoutError`.

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API:** Klucz API **nigdy** nie może być ujawniony po stronie klienta. Usługa `OpenRouterService` musi być używana wyłącznie po stronie serwera (np. w Astro API routes: `src/pages/api`). Klucz powinien być przechowywany w zmiennych środowiskowych (`.env`) i dodany do `.gitignore`.
2.  **Walidacja danych wejściowych:** Należy walidować i sanityzować `prompt` od użytkownika, aby zapobiec atakom typu "prompt injection". Można ograniczyć długość promptu i usunąć potencjalnie szkodliwe fragmenty.
3.  **Ograniczenie zapytań (Rate Limiting):** Aby chronić się przed nadużyciami i kontrolować koszty, warto zaimplementować mechanizm ograniczania liczby zapytań na poziomie API (np. per użytkownik lub adres IP).
4.  **Logowanie:** Należy unikać logowania pełnych danych wrażliwych (jak klucze API). Logi powinny zawierać tylko niezbędne informacje do debugowania.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja środowiska

1.  Utwórz plik `.env` w głównym katalogu projektu (jeśli jeszcze nie istnieje).
2.  Dodaj plik `.env` do `.gitignore`.
3.  W pliku `.env` dodaj swój klucz API OpenRouter:
    ```
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
4.  Zaktualizuj `src/env.d.ts`, aby TypeScript rozpoznawał nową zmienną środowiskową:
    ```typescript
    // src/env.d.ts
    /// <reference types="astro/client" />

    interface ImportMetaEnv {
      readonly OPENROUTER_API_KEY: string;
      // ... inne zmienne
    }

    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }
    ```

### Krok 2: Utworzenie pliku usługi

1.  Utwórz nowy plik: `src/lib/services/openRouterService.ts`.
2.  Zdefiniuj w nim typy dla ustrukturyzowanej odpowiedzi, które będą zgodne ze schematem JSON.
    ```typescript
    // src/lib/services/openRouterService.ts

    export interface Flashcard {
      question: string;
      answer: string;
    }

    export interface StructuredResponse {
      flashcards: Flashcard[];
      title: string;
    }
    ```

### Krok 3: Implementacja klasy `OpenRouterService`

1.  W pliku `src/lib/services/openRouterService.ts` zaimplementuj klasę `OpenRouterService` wraz z konstruktorem, jak opisano w sekcji 2.
2.  Dodaj metodę publiczną `generateFlashcards`. Ta metoda będzie orkiestrować cały proces.

    ```typescript
    // Wewnątrz klasy OpenRouterService

    public async generateFlashcards(prompt: string, modelName: string): Promise<StructuredResponse> {
      const systemMessage = "Jesteś ekspertem w tworzeniu fiszek do nauki. Twoim zadaniem jest wygenerowanie zestawu fiszek na podstawie dostarczonego tekstu. Odpowiedź musi być w formacie JSON zgodnym z podanym schematem.";
      
      const responseFormat = {
        type: 'json_schema',
        json_schema: {
          name: 'flashcardSet',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Tytuł zestawu fiszek, powiązany z tematem promptu.' },
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string', description: 'Pytanie na fiszce.' },
                    answer: { type: 'string', description: 'Odpowiedź na fiszce.' }
                  },
                  required: ['question', 'answer']
                }
              }
            },
            required: ['title', 'flashcards']
          }
        }
      };

      const payload = this.buildRequestPayload(systemMessage, prompt, modelName, responseFormat);
      const apiResponse = await this.sendRequest(payload);
      return this.parseAndValidateResponse(apiResponse);
    }
    ```

3.  Zaimplementuj metody prywatne `buildRequestPayload`, `sendRequest` i `parseAndValidateResponse`.

    ```typescript
    // Wewnątrz klasy OpenRouterService

    private buildRequestPayload(systemMessage: string, userMessage: string, modelName: string, responseFormat: object): object {
      return {
        model: modelName,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        response_format: responseFormat,
        // Można tu dodać inne parametry, np. temperature, max_tokens
        temperature: 0.7,
      };
    }

    private async sendRequest(payload: object): Promise<any> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(this.openRouterApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          // Rzucenie błędu z informacjami z API
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out after 30 seconds.');
        }
        // Rzucenie błędu dalej w celu obsługi w wyższej warstwie
        throw error;
      }
    }

    private parseAndValidateResponse(apiResponse: any): StructuredResponse {
      try {
        const content = apiResponse.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Invalid API response structure: content is missing.');
        }
        
        const parsedContent: StructuredResponse = JSON.parse(content);

        // Prosta walidacja struktury
        if (!parsedContent.title || !Array.isArray(parsedContent.flashcards)) {
            throw new Error('Validation failed: Parsed content does not match expected structure.');
        }

        return parsedContent;
      } catch (error) {
        // Logowanie błędu parsowania
        console.error("Failed to parse or validate API response:", error);
        throw new Error('Failed to process API response.');
      }
    }
    ```

### Krok 4: Integracja z API Astro

1.  Utwórz lub zmodyfikuj istniejący endpoint API w Astro, np. `src/pages/api/flashcards/generate.ts`.
2.  W tym pliku zaimportuj i użyj `OpenRouterService` do obsługi żądania `POST`.

    ```typescript
    // src/pages/api/flashcards/generate.ts
    import type { APIRoute } from 'astro';
    import { OpenRouterService } from '../../../lib/services/openRouterService';

    export const POST: APIRoute = async ({ request }) => {
      try {
        const body = await request.json();
        const { prompt, model } = body;

        if (!prompt || !model) {
          return new Response(
            JSON.stringify({ error: 'Prompt and model are required.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const openRouterService = new OpenRouterService();
        const result = await openRouterService.generateFlashcards(prompt, model);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('[API Generate Error]', error);
        return new Response(
          JSON.stringify({ error: error.message || 'An unexpected error occurred.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    };
    ```

Po wykonaniu tych kroków usługa `OpenRouterService` będzie w pełni zintegrowana z aplikacją, gotowa do generowania fiszek w sposób bezpieczny, skalowalny i zgodny z najlepszymi praktykami.
