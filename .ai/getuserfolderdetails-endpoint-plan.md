# API Endpoint Implementation Plan: Get Folder Details

## 1. Przegląd punktu końcowego
Endpoint Get Folder Details ma na celu pobranie szczegółowych informacji o danym folderze, w tym liczby powiązanych fiszek. Endpoint zapewnia, że dane folderu są przypisane do właściwego użytkownika dzięki obowiązkowemu parametrowi `user_id`.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/folders/{folderId}`
- **Parametry:**
  - **Wymagane:**
    - `folderId` (ścieżka) – identyfikator folderu
    - `user_id` (query) – UUID użytkownika
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **FolderDTO:** Zdefiniowany w `src/types.ts` (pomija pole `user_id` oraz dodaje opcjonalne `flashcard_count`)

## 4. Szczegóły odpowiedzi
- **Sukces (200):**
  ```json
  {
      "id": "<UUID>",
      "name": "Folder Name",
      "created_at": "...",
      "updated_at": "...",
      "flashcard_count": 25
  }
  ```
- **Błąd (404):** Folder nie znaleziony
- **Błąd (400):** Nieprawidłowe dane wejściowe (np. brak `user_id` lub `folderId` w złym formacie)
- **Błąd (500):** Błąd serwera

## 5. Przepływ danych
1. Klient wysyła zapytanie GET do `/folders/{folderId}` z dołączonym parametrem `user_id`.
2. Warstwa routingu przekazuje parametr `folderId` i `user_id` do odpowiedniego kontrolera endpointu.
3. Kontroler wywołuje logikę w serwisie (np. `folderService`) w celu:
   - Weryfikacji istnienia folderu o podanym `folderId`
   - Sprawdzenia, czy folder jest przypisany do użytkownika o identyfikatorze `user_id`
   - Pobrania liczby fiszek powiązanych z folderem (poprzez zapytanie do tabeli `flashcards`)
4. Wynik, zgodny z typem DTO (`FolderDTO`), jest zwracany jako odpowiedź HTTP.

## 6. Względy bezpieczeństwa
- Weryfikacja, czy przekazany `user_id` jest prawidłowym UUID oraz czy użytkownik ma prawo dostępu do danego folderu.
- Użycie mechanizmu uwierzytelniania/ autoryzacji (np. Supabase auth lub middleware) w celu zabezpieczenia endpointu przed nieautoryzowanym dostępem.
- Zapobieganie atakom SQL injection poprzez stosowanie parametrów w zapytaniach do bazy danych.

## 7. Obsługa błędów
- **404 Not Found:** Zwracane, gdy folder o podanym `folderId` nie istnieje lub nie jest przypisany do danego `user_id`.
- **400 Bad Request:** Zwracane, gdy brakuje wymaganego parametru `user_id` lub `folderId` jest w nieprawidłowym formacie.
- **500 Internal Server Error:** Błąd serwera, logowanie szczegółów błędu i zwrócenie komunikatu o awarii.

## 8. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych poprzez odpowiednie indeksowanie pól `id` i `user_id`.
- Możliwość wykorzystania cache'owania wyników, jeśli dane nie ulegają częstym zmianom.
- Minimalizacja obciążenia serwera poprzez zwracanie tylko niezbędnych danych (np. użycie `SELECT COUNT(*)` do pobrania liczby fiszek).

## 9. Etapy wdrożenia
1. **Projekt struktury endpointu:**
   - Zdefiniowanie nowej trasy w systemie routingu (np. w Astro w katalogu `src/pages/api`).
   - Utworzenie kontrolera obsługującego żądania GET do `/folders/{folderId}`.

2. **Implementacja logiki serwisowej:**
   - Weryfikacja poprawności parametrów wejściowych (`user_id` i `folderId`).
   - Pobranie danych folderu z bazy danych, uwzględniając filtrację po `user_id`.
   - Obliczenie liczby fiszek powiązanych z folderem.

3. **Walidacja danych wejściowych:**
   - Użycie Zod lub innej biblioteki do walidacji formatu UUID oraz obecności wymaganych pól.
   - Obsługa błędów walidacji i zwrócenie statusu 400 w przypadku nieprawidłowych danych.

4. **Integracja z bazą danych:**
   - Utworzenie zapytań SQL uwzględniających bezpieczeństwo i wydajność (np. przy użyciu parametrów zapytań).
   - Testowanie zapytań na danych testowych.

5. **Implementacja obsługi błędów:**
   - Dodanie mechanizmu logowania błędów (ewentualnie w dedykowanej tabeli logów), aby rejestrować nieudane próby dostępu lub inne nieoczekiwane błędy.
   - Upewnienie się, że wszystkie błędy są prawidłowo przekazywane do klienta z odpowiednimi kodami stanu.

6. **Testy jednostkowe i integracyjne:**
   - Przygotowanie testów dla różnych scenariuszy: prawidłowe dane wejściowe, brak folderu, błędne dane wejściowe, itd.
   - Uruchomienie testów w środowisku CI/CD.

7. **Dokumentacja:**
   - Uaktualnienie dokumentacji API, aby uwzględniała nowy endpoint i jego specyfikację.

8. **Wdrożenie:**
   - Wdrożenie zmian na środowisko testowe, monitorowanie logów i reakcja na zgłoszenia błędów.
   - Po pozytywnym testowaniu, wdrożenie zmian na środowisko produkcyjne.

---

Plan wdrożenia endpointu Get Folder Details zgodny jest z wytycznymi API, zasobami bazy danych oraz zasadami implementacji określonymi w dokumentach `shared.mdc`, `backend.mdc` oraz `astro.mdc`. Ten dokument stanowi kompleksowy przewodnik dla zespołu programistów, zapewniając bezpieczeństwo, wydajność oraz poprawną obsługę błędów.
