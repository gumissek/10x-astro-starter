# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint służy do usuwania pojedynczej fiszki na podstawie jej identyfikatora. Proces obejmuje weryfikację istnienia fiszki, sprawdzenie uprawnień użytkownika oraz wykonanie operacji usuwania z bazy danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** /flashcards/{flashcardId}
- **Parametry:**
  - **Wymagane:**
    - flashcardId (UUID) - identyfikator usuwanej fiszki, pobierany z URL
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **Flashcard:** Definicja pochodzi z `src/types.ts` (bez pola `user_id` dla DTO w zakresie operacji, choć `user_id` jest wykorzystywane do autoryzacji operacji)
- **Brak dedykowanego Command Model** - operacja usunięcia nie wymaga dodatkowych danych poza identyfikatorem w URL

## 4. Szczegóły odpowiedzi
- **Sukces (200):** Potwierdzenie pomyślnego usunięcia fiszki, np. `{ "message": "Flashcard deleted successfully." }`
- **Błąd (404):** Fiszka o podanym identyfikatorze nie została znaleziona, np. `{ "error": "Flashcard not found." }`
- **Błąd (401):** Nieautoryzowany dostęp, jeżeli użytkownik próbuje usunąć fiszkę nie należącą do niego
- **Błąd (500):** Błąd serwera w przypadku nieoczekiwanych problemów

## 5. Przepływ danych
1. Odebranie żądania DELETE z parametrem flashcardId z URL.
2. Walidacja formatowania flashcardId (sprawdzenie UUID).
3. Autoryzacja: sprawdzenie czy użytkownik wykonujący żądanie jest właścicielem fiszki:
   - Pobranie sesji użytkownika (np. z `context.locals` w Astro) i porównanie z `user_id` fiszki.
4. Wyszukanie fiszki w bazie danych:
   - Jeśli nie istnieje, zwrócenie błędu 404.
5. Wykonanie operacji usunięcia fiszki z bazy danych.
6. Zwrócenie odpowiedzi 200 z potwierdzeniem operacji.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:**
  - Endpoint powinien być dostępny tylko dla zalogowanych użytkowników.
  - Upewnienie się, że użytkownik może usuwać jedynie swoje fiszki (porównanie `user_id`).
- **Walidacja danych:**
  - Walidacja parametru `flashcardId` pod kątem poprawnego formatu UUID.
- **Obsługa wyjątków:**
  - Logowanie błędów operacyjnych przy nieoczekiwanych problemach.

## 7. Obsługa błędów
- **404 Not Found:** Zwracany, gdy fiszka o podanym identyfikatorze nie istnieje.
- **401 Unauthorized:** Zwracany, gdy użytkownik nie ma uprawnień do usunięcia danej fiszki.
- **500 Internal Server Error:** Zwracany w przypadku błędów po stronie serwera (np. problemów z połączeniem do bazy danych lub nieoczekiwanych wyjątków).

## 8. Rozważania dotyczące wydajności
- Optymalizacja operacji usuwania przez wykonanie zapytania SQL bezpośrednio na indeksowanych kolumnach (`id`, `user_id`).
- Zapewnienie, że struktura bazy danych ma odpowiednie indeksy na kolumnach używanych do wyszukiwania fiszki.
- Upewnienie się, że kaskadowe usuwanie (ON DELETE CASCADE) w tabeli folderów zostało poprawnie skonfigurowane.

## 9. Etapy wdrożenia
1. **Utworzenie/rozszerzenie usługi:**
   - Implementacja funkcji `deleteFlashcard` w serwisie, np. `src/lib/services/flashcardService.ts`.
2. **Implementacja walidacji:**
   - Sprawdzenie poprawności formatu `flashcardId` i zweryfikowanie autoryzacji użytkownika.
3. **Integracja z bazą danych:**
   - Wykonanie zapytania do bazy w celu usunięcia fiszki.
4. **Testy:**
   - Pokrycie operacji jednostkowymi i integracyjnymi testami sprawdzającymi wszystkie scenariusze (sukces, brak fiszki, nieautoryzowany dostęp, błędy serwera).
5. **Obsługa błędów:**
   - Implementacja obsługi wyjątków oraz logowania błędów.
6. **Wdrożenie i monitoring:**
   - Wdrożenie endpointa do środowiska testowego, monitorowanie logów oraz walidacja poprawności działania przed wdrożeniem na produkcję.



