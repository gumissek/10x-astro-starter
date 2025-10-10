# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji istniejącej fiszki. Umożliwia modyfikację tekstu fiszki (przód i tył), ewentualną zmianę folderu oraz typ źródła generacji (manual lub ai). Aktualizacja powinna być możliwa tylko dla fiszek należących do uwierzytelnionego użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT
- **Struktura URL:** `/flashcards/{flashcardId}`
- **Parametry:**
  - **Path parameter:** 
    - `flashcardId` (UUID) – identyfikator fiszki do aktualizacji.
  - **Request Body:**
    - **Wymagane:**
      - `front` (string, maks. 200 znaków)
      - `back` (string, maks. 500 znaków)
      - `generation_source` (string) – dozwolone wartości: "manual" lub "ai"
    - **Opcjonalne:**
      - `folder_id` (UUID) – nowy folder, pod warunkiem, że folder należy do użytkownika

## 3. Wykorzystywane typy
- **DTO i Command Modele:**
  - `UpdateFlashcardCommand`: Obejmuje pola `front`, `back`, `folder_id` oraz `generation_source`.
  - `FlashcardDTO`: Do zwracania zaktualizowanych szczegółów fiszki (bez pola `user_id`).

## 4. Przepływ danych
1. **Autentykacja i autoryzacja:** 
   - Sprawdzić, czy żądanie pochodzi od uwierzytelnionego użytkownika.
   - Zweryfikować, że fiszka należy do użytkownika.
2. **Walidacja danych wejściowych:**
   - Użyć biblioteki Zod do walidacji pól `front`, `back` (limit znaków) oraz sprawdzenia formatu `folder_id` i dozwolonych wartości `generation_source`.
3. **Logika biznesowa:**
   - Wyodrębnić logikę aktualizacji fiszki do dedykowanego serwisu (np. `flashcardService` w `src/lib/services/flashcardService.ts`).
   - W serwisie:
     - Pobierać istniejącą fiszkę.
     - Sprawdzać, czy nowy `folder_id` referuje istniejący folder użytkownika.
     - Aktualizować fiszkę w bazie danych, ustawiając nowe wartości i aktualizując pole `updated_at`.
4. **Interakcja z bazą danych:**
   - Wykonać zapytanie aktualizujące rekord w tabeli `flashcards`.
   - Zwrócić zaktualizowane dane fiszki jako odpowiedź.

## 5. Względy bezpieczeństwa
- **Autoryzacja:** Upewnić się, że użytkownik ma prawo modyfikować daną fiszkę.
- **Walidacja:** Dokładna walidacja danych wejściowych przy użyciu Zod aby zapobiec wprowadzeniu nieprawidłowych danych.
- **Sprawdzanie referencji:** Upewnić się, że `folder_id` należy do danego użytkownika.
- **Ochrona przed atakami:** Zabezpieczyć endpoint przed SQL Injection i innymi typowymi wektorami ataku.

## 6. Obsługa błędów
- **400 Bad Request:** 
  - Niewłaściwy format danych wejściowych (np. przekroczenie limitów znaków, niedozwolone wartości `generation_source`).
- **401 Unauthorized:**
  - Brak autentykacji lub nieprawidłowy token użytkownika.
- **404 Not Found:**
  - Fiszka lub folder nie zostały znalezione.
- **500 Internal Server Error:**
  - Ogólne błędy serwera, problemy z bazą danych lub nieoczekiwane wyjątki.
- **Logowanie błędów:** 
  - Wdrożyć mechanizm logowania błędów (np. do pliku lub systemu monitoringu) aby trackować wszelkie nieprawidłowości.

## 7. Rozważania dotyczące wydajności
- **Indeksowanie:** Upewnić się, że kolumny wykorzystywane przy wyszukiwaniu (np. `flashcardId`, `folder_id`) są odpowiednio indeksowane.
- **Caching:** Rozważyć caching w przypadku dużej liczby żądań, chociaż aktualizacja danych wymaga bezpośredniego dostępu do bazy.
- **Optymalizacja zapytań:** Minimalizować liczbę zapytań do bazy np. poprzez łączenie zapytań w jedną operację.

## 8. Etapy wdrożenia
1. **Analiza i projekt:**
   - Zweryfikować specyfikację API oraz istniejący model danych.
   - Ustalić zasady walidacji wg. Zod.
2. **Implementacja walidacji wejścia:**
   - Dodać lub zaktualizować schemat Zod do walidacji request payload.
3. **Wyodrębnienie logiki biznesowej:**
   - Utworzyć lub zaktualizować serwis `flashcardService` w `src/lib/services/flashcardService.ts`.
   - Zaimplementować funkcję aktualizacji, która weryfikuje uprawnienia użytkownika i poprawność `folder_id`.
4. **Implementacja endpointa:**
   - Utworzyć lub zaktualizować funkcję obsługującą żądanie PUT w `/flashcards/{flashcardId}`.
   - Połączyć endpoint z wyodrębnioną logiką serwisu.
5. **Testowanie i walidacja:**
   - Napisać testy jednostkowe oraz integracyjne sprawdzające scenariusze poprawne i błędne.
   - Zweryfikować odpowiedź endpointa dla prawidłowych oraz nieprawidłowych żądań.
6. **Wdrożenie i monitoring:**
   - Wdrożyć zmiany na środowisku testowym.
   - Monitorować logi oraz zachowanie endpointa w środowisku produkcyjnym.