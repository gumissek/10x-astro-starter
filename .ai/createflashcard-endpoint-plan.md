# API Endpoint Implementation Plan: Create Flashcard (Manual or AI Acceptance)

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowej fiszki na podstawie danych wprowadzonych manualnie lub zaakceptowanych z propozycji AI. Wdrożenie obsłuży walidację danych, autoryzację użytkownika oraz zapis fiszki w relacyjnej bazie danych zgodnie z ustalonym modelem.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /flashcards
- **Parametry:**
  - **Wymagane (w ciele żądania):**
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `folder_id` (UUID)
    - `generation_source` (string) – wartość `manual` lub `ai`
- **Request Body:**
  ```json
  {
      "front": "Flashcard front text (max 200 characters)",
      "back": "Flashcard back text (max 500 characters)",
      "folder_id": "<UUID>",
      "generation_source": "manual"  // lub "ai"
  }
  ```

## 3. Wykorzystywane typy
- **DTO:**
  - `FlashcardDTO` – reprezentuje strukturę zwracaną do klienta (pomijając `user_id`)
- **Command Model:**
  - `CreateFlashcardCommand` – zawiera pola `front`, `back`, `folder_id` oraz `generation_source`

## 4. Przepływ danych
1. Odebranie żądania POST na adres `/flashcards`.
2. Walidacja danych wejściowych przy użyciu Zod (sprawdzenie długości `front` i `back`, format UUID dla `folder_id`, akceptowalne wartości `generation_source`).
3. Uwierzytelnienie i autoryzacja – weryfikacja sesji użytkownika i sprawdzenie, czy folder należy do użytkownika.
4. Przekazanie danych do warstwy serwisów (`flashcardService`), która zajmie się logiką biznesową i interakcją z bazą danych.
5. Zapis nowej fiszki w tabeli `flashcards` w bazie danych Supabase.
6. Zwrócenie odpowiedzi 201 z danymi utworzonej fiszki lub odpowiedniego błędu w przypadku niepowodzenia.

## 5. Względy bezpieczeństwa
- Uwierzytelnienie: Wdrożenie sprawdza, czy użytkownik jest zalogowany (np. przy użyciu tokenu sesji/supabase).
- Autoryzacja: Weryfikacja, czy folder wskazany przez `folder_id` należy do zalogowanego użytkownika.
- Walidacja danych: Użycie Zod do walidacji i sanitizacji danych wejściowych.
- Ograniczenia: Maksymalne długości pól `front` i `back` oraz restrykcyjne sprawdzenie dozwolonych wartości dla `generation_source`.

## 6. Obsługa błędów
- **400 Bad Request:** Walidacja nieudana (np. przekroczenie limitu znaków, zły format UUID, nieprawidłowa wartość `generation_source`).
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony lub nie ma dostępu do wskazanego folderu.
- **404 Not Found:** Folder o podanym `folder_id` nie istnieje.
- **500 Internal Server Error:** Błąd podczas zapisu fiszki lub inny nieoczekiwany błąd serwera.

## 7. Rozważania dotyczące wydajności
- Minimalizacja zapytań do bazy danych – użycie transakcji w przypadku powiązanych operacji.
- Optymalizacja walidacji po stronie serwera, aby szybko odrzucać nieprawidłowe żądania.
- Rozważenie cache'owania dla często odczytywanych informacji, choć w tym przypadku priorytetem jest integralność zapisu.

## 8. Etapy wdrożenia
1. **Analiza i projekt:**
   - Zapoznanie się z dokumentacją API, modelem bazy danych oraz obowiązującymi zasadami implementacji.
2. **Walidacja danych:**
   - Implementacja walidacji przy użyciu Zod zgodnie z określonymi limitami i formatem wejściowym.
3. **Autoryzacja:**
   - Zaimplementowanie mechanizmu uwierzytelnienia oraz sprawdzania przynależności folderu do użytkownika.
4. **Logika biznesowa:**
   - Wyodrębnienie logiki do serwisu (`flashcardService`), który zajmie się tworzeniem fiszki w bazie oraz obsługą ewentualnych wyjątków.
5. **Integracja z bazą danych:**
   - Użycie Supabase do zapisu rekordu w tabeli `flashcards` z zachowaniem relacji kaskadowych.
6. **Testy jednostkowe i integracyjne:**
   - Przygotowanie testów pokrywających scenariusze sukcesu oraz różne rodzaje błędów (walidacyjne, autoryzacyjne, systemowe).
7. **Logowanie i monitorowanie:**
   - Implementacja logowania błędów i monitorowania endpointu w środowisku produkcyjnym.
8. **Dokumentacja:**
   - Aktualizacja dokumentacji API wraz ze szczegółowym opisem działania nowego punktu końcowego.
9. **Deploy i monitoring:**
   - Wdrożenie zmiany oraz monitorowanie działania endpointu po wdrożeniu, analiza logów i ewentualna optymalizacja.
