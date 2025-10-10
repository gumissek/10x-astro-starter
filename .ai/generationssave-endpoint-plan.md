# API Endpoint Implementation Plan: Bulk Save Accepted Flashcards

## 1. Przegląd punktu końcowego
Endpoint służy do zbiorczego zapisywania zaakceptowanych fiszek przez użytkownika do określonego folderu. Po weryfikacji danych, endpoint umieszcza fiszki w bazie danych, zapewniając spójność i walidację danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /flashcards/bulk-save
- **Parametry:**
  - **Wymagane:** 
    - `user_id` (UUID): Identyfikator użytkownika wysyłającego żądanie
    - `folder_id` (UUID): Identyfikator folderu, do którego mają być zapisane fiszki
    - `flashcards` (Tablica obiektów): Każdy obiekt musi zawierać:
      - `front`: Tekst przedniej strony fiszki (max 200 znaków)
      - `back`: Tekst tylnej strony fiszki (max 500 znaków)
      - `generation_source`: Stała wartość 'ai'
- **Request Body:** Przykładowa struktura:
  ```json
  {
    "user_id": "<UUID>",
    "folder_id": "<UUID>",
    "flashcards": [
      { "front": "Przykładowy front", "back": "Przykładowy back", "generation_source": "ai" }
    ]
  }
  ```

## 3. Wykorzystywane typy
- **DTO / Command Modele:**
  - `BulkSaveFlashcardsCommand` zdefiniowany w `src/types.ts`
    - Struktura: {
      folder_id: string,
      flashcards: Array<{ front: string; back: string; generation_source: 'ai'; }>
    }
  - Użycie istniejących typów dla `user_id` i `folder_id` zgodnych z danymi tabel `auth.users` oraz `folders`.

## 4. Przepływ danych
1. Żądanie przychodzi na endpoint `/flashcards/bulk-save` metodą POST.
2. Warstwa middleware przeprowadza wstępną autoryzację (sprawdzenie tokenu sesji i zgodności `user_id`).
3. Dane wejściowe są walidowane według następujących kryteriów:
   - `user_id` i `folder_id` są prawidłowymi UUID
   - Dla każdego obiektu w tablicy `flashcards`, `front` nie przekracza 200 znaków, `back` nie przekracza 500 znaków oraz `generation_source` jest równe `ai`
4. Logika przetwarzania jest delegowana do warstwy serwisowej (np. metoda w `flashcardService` lub nowy serwis dedykowany do operacji zbiorczych), który wykonuje operację zapisu w bazie danych.
5. Po zapisie zostaje przesłana odpowiedź, zawierająca potwierdzenie i listę ID utworzonych fiszek.

## 5. Względy bezpieczeństwa
- Autoryzacja: Upewnienie się, że użytkownik wykonujący operację ma dostęp do określonego folderu (sprawdzenie zgodności `user_id` z właścicielem folderu).
- Walidacja danych wejściowych, aby zapobiec wstrzyknięciom (SQL injection, nieprawidłowe dane) oraz przekroczeniu limitów znaków.
- Użycie odpowiednich schematów np. z Zod do walidacji.

## 6. Obsługa błędów
- **400 Bad Request:** Przy nieprawidłowych danych wejściowych (np. błędny UUID, zły format fiszki, przekroczone limity znaków).
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany lub token sesji jest niepoprawny.
- **404 Not Found:** Gdy folder o podanym `folder_id` nie istnieje lub nie należy do użytkownika.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwera lub problemów z bazą danych.

## 7. Rozważania dotyczące wydajności
- Optymalizacja operacji zapisu poprzez zastosowanie funkcji bulk insert w bazie danych (np. przy użyciu jednego zapytania INSERT z wieloma wartościami).
- Użycie transakcji, aby zapewnić spójność danych w przypadku częściowej awarii operacji.
- Logowanie operacji dla celów monitoringu i optymalizacji.

## 8. Etapy wdrożenia
1. **Walidacja danych:**
   - Zdefiniowanie schematu walidacji przy użyciu Zod lub innego narzędzia, sprawdzającego UUID, limity znaków oraz wartość `generation_source`.
2. **Autoryzacja:**
   - Weryfikacja tokenu sesji oraz potwierdzenie, że `user_id` pasuje do użytkownika wykonującego operację oraz że folder należy do tego użytkownika.
3. **Logika serwisowa:**
   - Dodanie lub rozszerzenie metody w serwisie (np. `flashcardService.bulkSaveFlashcards`) odpowiedzialnej za realizację zapisu zbiorczego.
4. **Interakcja z bazą danych:**
   - Implementacja transakcji oraz zapisanie wielu fiszek w jednym poleceniu SQL w celu poprawy wydajności.
5. **Obsługa błędów:**
   - Zdefiniowanie bloków try/catch zabezpieczających przed nieoczekiwanymi problemami oraz logowanie błędów.
6. **Testy:**
   - Przygotowanie testów jednostkowych i integracyjnych, pokrywających różne scenariusze (poprawne dane, niepoprawne dane, brak folderu, nieautoryzowany dostęp).
7. **Dokumentacja:**
   - Uaktualnienie dokumentacji API i schematów DTO zgodnie z wprowadzonymi zmianami.


---

Plan zapisany jako plik: `.ai/generationssave-endpoint-plan.md`
