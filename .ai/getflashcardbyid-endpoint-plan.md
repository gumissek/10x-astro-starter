# API Endpoint Implementation Plan: Get Flashcard Details

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółowych informacji o konkretnej fiszce na podstawie jej identyfikatora. Funkcjonalność ta jest kluczowa dla aplikacji umożliwiającej wyświetlanie, edycję lub dalsze przetwarzanie danych fiszek.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /flashcards/{flashcardId}
- **Parametry:**
  - **Wymagane:**
    - flashcardId (UUID) – unikalny identyfikator fiszki
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **DTO:** `FlashcardDTO` (definiowany w `src/types.ts`), który zawiera pola: id, front, back, generation_source, folder_id, created_at, updated_at.
- **Command Model:** Nie występuje, gdyż metoda GET nie przesyła danych przez body.

## 4. Szczegóły odpowiedzi
- **Sukces (200):** Zwrócony zostaje obiekt fiszki oparty o `FlashcardDTO`.
  ```json
  {
    "id": "<UUID>",
    "front": "Text",
    "back": "Text",
    "generation_source": "ai or manual",
    "folder_id": "<UUID>",
    "created_at": "...",
    "updated_at": "..."
  }
  ```
- **Błąd (404):** Fiszka nie została odnaleziona.

## 5. Przepływ danych
1. Żądanie przychodzi do endpointu `/flashcards/{flashcardId}`.
2. Warstwa middleware (jeśli dotyczy) weryfikuje autentykację użytkownika.
3. Logika biznesowa, wyodrębniona do serwisu (np. `flashcardService` w `src/lib/services/flashcardService.ts`), dokonuje walidacji formatu identyfikatora oraz pobiera dane fiszki z bazy Supabase (używając klienta z `src/db/supabase.client.ts`).
4. W przypadku powodzenia, dane zostają zwrócone w odpowiedzi z kodem 200. Jeśli fiszka nie zostanie znaleziona, endpoint zwraca kod 404.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Endpoint powinien wykorzystywać sesję użytkownika (np. przez `context.locals.supabase`) aby upewnić się, że użytkownik ma dostęp tylko do własnych zasobów.
- **Walidacja UUID:** Sprawdzenie, czy parametr flashcardId jest poprawnym UUID.
- **Ochrona przed SQL Injection:** Użycie bezpiecznych metod pobierania danych przy wykorzystaniu Supabase.

## 7. Obsługa błędów
- **404 - Not Found:** Zwrócony gdy fiszka o danym identyfikatorze nie istnieje.
- **400 - Bad Request:** Możliwe w przypadku niepoprawnego formatu flashcardId.
- **500 - Internal Server Error:** Ogólne błędy serwera.
- Każdy błąd powinien być logowany (ewentualnie zapis do centralnego systemu logowania) aby umożliwić dalszą diagnostykę.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:** Upewnić się, że zapytanie do bazy jest zoptymalizowane (wybieranie tylko niezbędnych pól, indeksy na kolumnach wykorzystywanych w zapytaniach np. id).
- **Cache:** Rozważyć wprowadzenie cache’u dla częstych zapytań, jeśli to uzasadnione.

## 9. Etapy wdrożenia
1. **Definicja endpointu:** Utworzenie pliku/API route (np. `src/pages/api/flashcards/[flashcardId].ts`) dla metody GET.
2. **Walidacja identyfikatora:** Implementacja weryfikacji formatu flashcardId przy użyciu narzędzia walidacyjnego (np. Zod).
3. **Implementacja logiki biznesowej:** Przeniesienie logiki pobierania danych fiszki do serwisu, zapewniając poprawną komunikację z Supabase.
4. **Implementacja autoryzacji:** Sprawdzenie, czy użytkownik ma prawo dostępu do żądanej fiszki.
5. **Obsługa odpowiedzi:** Zaimplementowanie zwracania prawidłowych kodów statusu w zależności od rezultatu operacji (200, 404, 400, 500).
6. **Testowanie:** Przeprowadzenie testów jednostkowych i integracyjnych, aby upewnić się, że endpoint działa zgodnie ze specyfikacją.
7. **Dokumentacja:** Aktualizacja dokumentacji API, jeśli istnieje taka potrzeba (np. Swagger/OpenAPI).
8. **Review i wdrożenie:** Przeprowadzenie code review oraz wdrożenie endpointu na środowisko testowe przed publikacją na produkcji.
