# API Endpoint Implementation Plan: Generate Flashcards via AI

## 1. Przegląd punktu końcowego
Endpoint ma na celu przyjmowanie tekstu (do 5000 znaków) i zwracanie propozycji fiszek wygenerowanych przez integrację z API GPT-4o-mini, wraz z sugerowaną nazwą folderu. Endpoint wspiera automatyzację generowania treści dydaktycznych. Na tym etapie mock danych jest wystarczający, a integracja z API GPT-4o-mini może być dodana później.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /flashcards/generate
- **Parametry:**
  - **Wymagane:**
    - `text` (string, max 5000 znaków) – tekst wejściowy do generowania fiszek
  - **Opcjonalne:** brak
- **Request Body:**
  ```json
  {
    "text": "..."
  }
  ```

## 3. Wykorzystywane typy
- **Command Model:** `GenerateFlashcardsCommand` (zawiera pole `text`)
- **DTO odpowiedzi:** `GenerateFlashcardsResponseDTO` zawierający:
  - `suggested_folder_name` (string)
  - `flashcards_proposals` – tablica obiektów z polami:
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `generation_source` – stała wartość `ai`

## 4. Szczegóły odpowiedzi
- **Kod 200:** Sukces – zwrócone dane w formacie:
  ```json
  {
    "suggested_folder_name": "Generated Folder Name",
    "flashcards_proposals": [
      {
        "front": "Generated front text",
        "back": "Generated back text",
        "generation_source": "ai"
      }
    ]
  }
  ```
- **Kod 400:** Błąd walidacji (np. tekst za długi lub nieprawidłowy format danych)
- **Kod 500:** Błąd serwera w przypadku nieoczekiwanych problemów

## 5. Przepływ danych
1. Klient wysyła żądanie z polem `text` (do 5000 znaków).
2. Warstwa kontrolera odbiera żądanie i przekazuje dane do warstwy walidacji.
3. Jeśli dane są poprawne, logika biznesowa (service) przetwarza dane:
   - Walidacja limitu znaków za pomocą Zod
   - Wywołanie integracji z API GPT-4o-mini (ewentualnie asynchroniczne wywołanie) w celu wygenerowania treści fiszek
4. Wynik działania serwisu zawiera sugerowaną nazwę folderu oraz listę propozycji fiszek.
5. Dane są mapowane do DTO i zwracane do klienta.

## 6. Względy bezpieczeństwa
- **Autentykacja & Autoryzacja:** Endpoint wymaga weryfikacji użytkownika wykorzystując `supabase` z `context.locals`.
- **Walidacja danych:** Użycie Zod do walidacji długości tekstu (max 5000 znaków) oraz struktury danych odpowiedzi.
- **Bezpieczeństwo transmisji:** Korzystanie z HTTPS, aby zapewnić szyfrowanie przesyłanych danych.
- **Ograniczenia:** Ochrona przed atakami typu DoS poprzez limit rozmiaru żądania.

## 7. Obsługa błędów
- **400 Bad Request:** Gdy dane wejściowe są nieprawidłowe lub przekraczają limit znaków.
- **401 Unauthorized:** Gdy użytkownik nie jest zweryfikowany.
- **500 Internal Server Error:** W przypadku błędów wewnętrznych, np. problem z integracją z API GPT-4o-mini lub błąd w logice biznesowej.
- **Logowanie błędów:** Błędy powinny być rejestrowane zgodnie z wewnętrznym systemem logowania, co umożliwi monitorowanie i analizę incydentów.

## 8. Rozważania dotyczące wydajności
- **Ograniczenie długości wejścia:** Maksymalnie 5000 znaków zapewnia kontrolę nad obciążeniem.
- **Optymalizacja wywołań API:** Wdrożenie cache'owania wyników dla powtarzających się podobnych zapytań (opcjonalnie).
- **Asynchroniczność:** Ew. asynchroniczne przetwarzanie żądań generowania fiszek, jeśli czas odpowiedzi API GPT-4o-mini jest dłuższy.
- **Timeouty dla wywołania AI:** 60 sekundowy timeout na wywołania zewnętrzne do API GPT-4o-mini, aby uniknąć długotrwałych blokad, inaczej bład timeout.

## 9. Etapy wdrożenia
1. **Stworzenie endpointu**:
   - Utworzenie nowego pliku w `src/pages/api/flashcards/generate.ts` obsługującego metodę POST.
2. **Walidacja wejścia:**
   - Implementacja walidacji danych wejściowych przy użyciu Zod.
3. **Integracja z usługą AI:**
   - Wyodrębnienie logiki generowania fiszek do osobnego service (np. `src/lib/services/flashcardService.ts`).
   - Implementacja komunikacji z API GPT-4o-mini.
4. **Mapowanie odpowiedzi:**
   - Mapowanie danych z serwisu do `GenerateFlashcardsResponseDTO`.
5. **Obsługa błędów:**
   - Ustawienie mechanizmów try/catch oraz odpowiednich kodów statusu w odpowiedzi.
   - Rejestrowanie błędów przy użyciu centralnego systemu logowania
6. **Dokumentacja:**
   - Aktualizacja dokumentacji API oraz dodanie przykładowych żądań i odpowiedzi.
7. **Wdrożenie:**
   - Przeprowadzenie code review, scalanie i wdrożenie do środowiska testowego, a następnie produkcyjnego.



