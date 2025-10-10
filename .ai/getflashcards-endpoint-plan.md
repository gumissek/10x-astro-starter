# API Endpoint Implementation Plan: List Flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie listy fiszek użytkownika, z możliwością filtrowania po folderze. Udostępnia paginację oraz sortowanie wyników.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /flashcards
- **Parametry zapytania:**
  - **Wymagane:**
    - Brak obowiązkowych parametrów (jednak uwierzytelnienie jest wymagane)
  - **Opcjonalne:**
    - `folderId` - filtruje fiszki według określonego folderu
    - `page` - numer strony (domyślnie 1)
    - `limit` - liczba elementów na stronę (domyślnie 10)
    - `sortBy` - kolumna sortowania (np. `created_at`)
    - `order` - kolejność sortowania (np. `asc` lub `desc`)
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `FlashcardDTO` – przedstawia strukturę pojedynczej fiszki (bez `user_id`)
  - Możliwe dodatkowe typy pomocnicze na potrzeby paginacji, np. obiekt zawierający dane paginacji

## 4. Szczegóły odpowiedzi
- **Kod statusu 200 (OK):**
  ```json
  {
    "flashcards": [
      {
        "id": "<UUID>",
        "front": "Text",
        "back": "Text",
        "generation_source": "ai or manual",
        "folder_id": "<UUID>",
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 100 }
  }
  ```

## 5. Przepływ danych
1. Uwierzytelnienie: Weryfikacja sesji użytkownika przy użyciu mechanizmu wbudowanego (np. Supabase auth) – dostęp przez `context.locals`.
2. Walidacja zapytań: Wykorzystanie Zod do walidacji parametrów (`folderId`, `page`, `limit`, `sortBy`, `order`).
3. Pobieranie danych: Wywołanie metody serwisowej, która pobiera fiszki z bazy danych, uwzględniając warunki filtrowania (np. `user_id`, `folder_id`) oraz paginację i sortowanie.
4. Transformacja danych: Mapowanie wyników zapytania bazy danych do struktury `FlashcardDTO`.
5. Odpowiedź: Zwrócenie sformatowanej odpowiedzi z listą fiszek i metadanymi paginacji.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie:** Endpoint powinien działać tylko dla uwierzytelnionych użytkowników.
- **Autoryzacja:** Zapewnienie, że użytkownik ma dostęp tylko do swoich fiszek.
- **Walidacja danych:** Użycie Zod do rygorystycznej walidacji wejścia, aby zapobiec wstrzyknięciu nieprawidłowych danych.
- **Bezpieczeństwo bazy danych:** Użycie parametrów zapytań aby zapobiec SQL Injection, a także odpowiednie indeksowanie kolumn (np. `user_id` i `folder_id`).

## 7. Obsługa błędów
- **Błąd 400 (Bad Request):** W przypadku nieprawidłowych danych wejściowych (np. błędny format `folderId`, `page`, `limit`, `order`).
- **Błąd 401 (Unauthorized):** Jeśli użytkownik nie jest uwierzytelniony.
- **Błąd 404 (Not Found):** Jeśli nie znaleziono danych (np. folder o podanym `folderId` nie istnieje).
- **Błąd 500 (Internal Server Error):** W przypadku błędów po stronie serwera lub problemów z bazą danych.

## 8. Rozważania dotyczące wydajności
- **Paginacja:** Zastosowanie limitu i offsetu, co pozwala na efektywne pobieranie danych.
- **Indeksowanie:** Upewnić się, że kolumny `user_id` oraz `folder_id` są zaindeksowane dla szybkich zapytań.
- **Łączenie zapytań:** Minimowanie liczby zapytań do bazy danych poprzez agregację danych paginacji w jednym zapytaniu.

## 9. Etapy wdrożenia
1. **Przygotowanie walidacji:** Zdefiniowanie schematu Zod dla parametrów zapytania.
2. **Implementacja logiki serwisowej:** Utworzenie lub uzupełnienie serwisu odpowiedzialnego za pobieranie fiszek z bazy danych, z zastosowaniem filtracji, paginacji i sortowania.
3. **Integracja z API:** Dodanie endpointu `/flashcards` w warstwie API, pobieranie użytkownika z `context.locals` oraz wywołanie metody serwisowej.
4. **Obsługa błędów:** Dodanie odpowiednich bloków try-catch oraz logiki zwracania właściwych kodów statusu przy napotkaniu błędów.
5. **Testy:** Utworzenie testów jednostkowych i integracyjnych, które weryfikują poprawność działania endpointu przy różnych scenariuszach wejścia.
6. **Optymalizacja:** Monitorowanie wydajności i ewentualne dostosowanie zapytań w celu poprawy szybkości wykonania.
7. **Dokumentacja:** Aktualizacja dokumentacji API, aby odzwierciedlała nowy endpoint oraz zasady jego działania.
