# API Endpoint Implementation Plan: Update Folder

## 1. Przegląd punktu końcowego
Plan wdrożenia endpointu REST API umożliwiającego aktualizację nazwy folderu. Endpoint zapewnia, że tylko właściciel folderu (zweryfikowany przez parametr `user_id`) może dokonać zmiany nazwy folderu.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT
- **URL:** /folders/{folderId}
- **Parametry:**
  - **Wymagane:**
    - `user_id` (UUID) – identyfikator użytkownika potwierdzający własność folderu
  - **Opcjonalne:** Brak
- **Request Body:**
  ```json
  { "name": "Updated Folder Name" }
  ```
  Wymagane pole: `name` (string)

## 3. Wykorzystywane typy
- **DTO:** FolderDTO – używany do zwracania szczegółów folderu
- **Command Model:** UpdateFolderCommand (czyli Pick<Folder, 'name'>) – reprezentuje nowe dane folderu

## 4. Szczegóły odpowiedzi
- **200 OK:** Zwraca zaktualizowane szczegóły folderu (FolderDTO)
- **400 Bad Request:** Dane wejściowe są nieprawidłowe lub występuje problem z duplikacją nazwy
- **404 Not Found:** Folder nie został znaleziony albo nie należy do podanego użytkownika
- **500 Internal Server Error:** Błąd po stronie serwera

## 5. Przepływ danych
1. Weryfikacja obecności query parametru `user_id` oraz parametru `folderId` w URL.
2. Walidacja danych wejściowych w request body (np. niepusty string dla `name`).
3. Autoryzacja – weryfikacja, czy folder należy do użytkownika (porównanie `user_id` z własnością folderu w bazie).
4. Aktualizacja rekordu folderu w bazie danych przy zachowaniu unikalności pary (`user_id`, `name`).
5. Zwrócenie zaktualizowanych danych folderu jako odpowiedź.

## 6. Względy bezpieczeństwa
- Stosowanie walidacji z użyciem biblioteki Zod lub podobnej, aby upewnić się, że dane wejściowe są poprawne.
- Weryfikacja autentyczności użytkownika poprzez query parametr `user_id`.
- Ograniczenie dostępu do folderu, aby operację mógł wykonać tylko właściciel.
- Ochrona przed atakami typu SQL Injection poprzez użycie zapytań parametryzowanych lub ORM.

## 7. Obsługa błędów
- **400 Bad Request:** Błędy walidacyjne (np. pusta lub niepoprawna nazwa folderu).
- **404 Not Found:** Folder nie istnieje lub nie jest własnością użytkownika.
- **500 Internal Server Error:** Nieprzewidziane błędy systemowe (np. problem z bazą danych).
- Rejestrowanie błędów za pomocą systemu logowania, co ułatwi diagnostykę problemów.

## 8. Rozważania dotyczące wydajności
- Upewnienie się, że zapytania do bazy danych są zoptymalizowane, używając indeksów na kolumnach `user_id` i `name`.
- Rozważenie transakcji dla aktualizacji, aby zapewnić spójność danych.
- Ograniczenie obciążenia serwera poprzez właściwe zarządzanie połączeniami do bazy.

## 9. Etapy wdrożenia
1. Utworzenie i konfiguracja endpointa PUT `/folders/{folderId}`.
2. Implementacja walidacji danych wejściowych przy użyciu Zod lub innej biblioteki walidacyjnej.
3. Wdrożenie funkcji serwisowej (np. w `folderService`) odpowiedzialnej za aktualizację nazwy folderu.
4. Weryfikacja autoryzacji – sprawdzenie, czy folder należy do `user_id` przekazanego w zapytaniu.
5. Aktualizacja rekordu w bazie danych zgodnie z zasadami unikalności (kombinacja `user_id` i `name`).
6. Implementacja obsługi i rejestracji błędów, ze zwracaniem odpowiednich kodów stanu.
7. Testowanie endpointa:
   - Poprawne żądanie aktualizacji folderu
   - Żądania z nieprawidłowymi danymi, brakującym `user_id`, lub folderem nie należącym do użytkownika
8. Dokumentacja endpointa i przekazanie informacji zespołowi developerskiemu.
