# API Endpoint Implementation Plan: Create Folder Endpoint

## 1. Przegląd punktu końcowego
Endpoint ten umożliwia tworzenie nowego folderu dla uwierzytelnionego użytkownika. Po wysłaniu poprawnego żądania, nowy folder zostanie zapisany w bazie danych z odniesieniem do użytkownika, co pozwala na organizację danych i zarządzanie fiszkami.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /folders
- **Parametry:**
  - **Wymagane (w ciele żądania):**
    - `name` (string): Nazwa nowego folderu.
    - `user_id` (UUID): Identyfikator użytkownika, który jest właścicielem folderu.
  - **Opcjonalne:** Brak
- **Request Body Example:**
  ```json
  {
    "name": "New Folder Name",
    "user_id": "<UUID>"
  }
  ```

## 3. Wykorzystywane typy
- **DTO i Command Modele:**
  - `FolderDTO` - reprezentacja folderu dla operacji odczytu z dodatkowymi polami, np. `flashcard_count`.
  - `CreateFolderCommand` - model danych wymagany do stworzenia folderu, zawierający pole `name`.

## 4. Szczegóły odpowiedzi
- **Sukces (201):** Nowo utworzony folder, zwracany w formie JSON z danymi folderu (id, name, created_at, updated_at, ewentualnie flashcard_count).
- **Błędy:**
  - 400: Błędne dane wejściowe lub walidacyjne (np. brak lub duplikat nazwy, brak user_id).
  - 401: Nieautoryzowany dostęp, jeżeli użytkownik nie jest uwierzytelniony.
  - 500: Błąd serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie POST do endpointu `/folders` z danymi JSON zawierającymi `name` i `user_id`.
2. Warstwa middleware weryfikuje autentykację użytkownika oraz przypisuje dane do kontekstu (np. `context.locals.supabase`).
3. Walidacja danych wejściowych odbywa się przy użyciu narzędzi takich jak zod, sprawdzając poprawność i unikalność danych (unikalność pary `user_id` i `name`).
4. Logika warstwy serwisowej przetwarza żądanie, wywołując operację tworzenia folderu w bazie danych przy użyciu odpowiedniego klienta Supabase.
5. W przypadku sukcesu, dane nowo utworzonego folderu są zwracane klientowi z kodem 201.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Upewnij się, że użytkownik jest zalogowany przed wykonaniem operacji. Dane `user_id` powinny pochodzić z kontekstu sesji, a nie z ciała żądania, jeżeli to możliwe.
- **Walidacja danych:** Sprawdzenie wszystkich pól wejściowych, aby zapobiec wstrzyknięciom SQL i innym atakom typu injection.
- **Unikalność danych:** Zapewnienie, że kombinacja (`user_id`, `name`) jest unikalna. 
- **Bezpieczeństwo bazy danych:** Upewnij się, że operacje na bazie danych odbywają się przy użyciu zaufanego połączenia i z odpowiednimi ograniczeniami dostępu.

## 7. Obsługa błędów
- **Walidacja danych:** Jeśli dane wejściowe są niepoprawne, zwróć kod 400 wraz z komunikatem o błędzie.
- **Błąd autoryzacji:** Brak ważnego tokenu uwierzytelniającego powoduje zwrócenie kodu 401.
- **Konflikt danych:** W przypadku duplikacji (ten sam `name` dla danego `user_id`), zwróć status 400 z informacją o konflikcie.
- **Błędy serwera:** W przypadku nieoczekiwanych wyjątków, zwróć kod 500 z ogólnym komunikatem o błędzie.

## 8. Rozważania dotyczące wydajności
- **Baza danych:** Upewnić się, że istnieją indeksy na polach `user_id` i `name` w tabeli `folders` dla szybszych zapytań walidacyjnych.
- **Caching:** Możliwość zastosowania cache dla powszechnie odczytywanych danych, jednak w przypadku tworzenia zasobu mniej istotny.
- **Optymalizacja walidacji:** Walidacja danych wejściowych powinna być lekka i wykonywana lokalnie przed wysłaniem żądania do bazy danych.

## 9. Etapy wdrożenia
1. **Przygotowanie projektu:** Upewnić się, że konfiguracja środowiska (Supabase, Zod, itp.) jest poprawna.
2. **Implementacja walidacji:** Zaimplementować walidację żądania przy użyciu Zod w kontrolerze endpointu.
3. **Warstwa serwisowa:** Wyodrębnić logikę tworzenia folderu do dedykowanego serwisu (np. `folderService.ts`) w katalogu `src/lib/services`.
4. **Integracja z bazą danych:** Użyć klienta Supabase (z `src/db/supabase.client.ts`) do operacji na tabeli `folders` uwzględniając unikalność (`user_id`, `name`).
5. **Middleware:** Zaimplementować lub zaktualizować middleware w celu weryfikacji sesji użytkownika i przekazywania kontekstu.
6. **Testowanie:** Utworzyć testy jednostkowe i integracyjne obejmujące scenariusze sukcesu oraz błędy walidacyjne.
7. **Monitorowanie błędów:** Wprowadzić logowanie błędów i monitorowanie (np. przy użyciu narzędzi do logowania i raportowania błędów).
8. **Dokumentacja:** Zaktualizować dokumentację API oraz plan wdrożenia.

### Dodatkowe uwagi
- Ze względu na specyfikę Supabase oraz zasady backendowe projektu, warto upewnić się, że warstwa serwisowa nie odwołuje się bezpośrednio do `supabase` z importu, lecz używa obiektu z `context.locals`.
- Rozważ refaktoryzację istniejących usług, aby zachować spójność architektoniczną.
