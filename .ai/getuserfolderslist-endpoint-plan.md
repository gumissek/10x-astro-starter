# API Endpoint Implementation Plan: List Folders

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania listy folderów przypisanych do zalogowanego użytkownika. Zapewnia paginację wyników oraz filtrowanie po `user_id` aby zwrócić tylko foldery danego użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /folders
- **Parametry zapytania:**
  - **Wymagane:**
    - `user_id` - UUID użytkownika, dla którego mają być pobrane foldery
  - **Opcjonalne:**
    - `page` - numer strony (domyślnie 1)
    - `limit` - liczba elementów na stronę (domyślnie 10)
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **DTO:**
  - `FolderDTO` – zawiera pola folderu, z dodatkowym polem `flashcard_count` dla szczegółów.

## 4. Szczegóły odpowiedzi
- **Kod sukcesu:** 200
- **Struktura odpowiedzi (JSON):**
  ```json
  {
    "folders": [
      { "id": "<UUID>", "name": "Folder Name", "created_at": "...", "updated_at": "..." }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 50 }
  }
  ```
- W przypadku błędów, odpowiedzi mogą zwracać:
  - 400 – nieprawidłowe dane wejściowe
  - 401 – nieautoryzowany dostęp
  - 404 – nie znaleziono folderów
  - 500 – błąd po stronie serwera

## 5. Przepływ danych
1. Klient wysyła zapytanie GET z wymaganym parametrem `user_id` oraz opcjonalnie `page` i `limit`.
2. Warstwa middleware autoryzuje użytkownika i potwierdza zgodność `user_id` z sesją.
3. Logika w serwisie (service) wykonuje zapytanie do bazy danych, filtrując foldery według `user_id` oraz stosując paginację.
4. Dane są mapowane do typu `FolderDTO` i opakowane w strukturę zawierającą informacje paginacyjne.
5. Odpowiedź jest zwracana do klienta.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie oraz autoryzacja – upewnić się, że użytkownik ma dostęp tylko do swoich zasobów.
- Walidacja parametru `user_id` – sprawdzić, czy jest poprawnym UUID.
- Ochrona przed atakami typu SQL Injection poprzez użycie parametrów zapytań lub ORM.

## 7. Obsługa błędów
- **400 Bad Request:** dla nieprawidłowo sformatowanych parametrów (np. nieprawidłowy UUID w `user_id`).
- **401 Unauthorized:** gdy użytkownik nie jest uwierzytelniony lub `user_id` nie odpowiada sesji.
- **404 Not Found:** gdy nie znaleziono folderów dla danego `user_id`.
- **500 Internal Server Error:** w przypadku awarii systemu lub problemów z bazą danych.

## 8. Rozważania dotyczące wydajności
- Wykorzystanie paginacji, aby ograniczyć ilość danych zwracanych na jedno zapytanie.
- Optymalizacja zapytań do bazy danych poprzez indeksowanie kolumn takich jak `user_id`.
- Cache'owanie wyników w przypadku dużego obciążenia i częstych odczytów.

## 9. Etapy wdrożenia
1. **Analiza i projekt:**
   - Przegląd specyfikacji API i definicji typów z `types.ts`.
   - Określenie procesu walidacji danych wejściowych.
2. **Implementacja middleware:**
   - Zapewnienie, że middleware autoryzuje użytkownika i przekazuje właściwy `user_id` do logiki endpointu.
3. **Implementacja serwisu:**
   - Utworzenie lub rozszerzenie istniejącego serwisu, który odpowiada za pobieranie folderów na podstawie `user_id` oraz stosowanie paginacji.
4. **Walidacja i mapowanie danych:**
   - Wykorzystanie zod lub podobnego narzędzia do walidacji parametrów zapytania.
   - Mapowanie wyników zapytania do typu `FolderDTO`.
5. **Testy jednostkowe i integracyjne:**
   - Przygotowanie testów sprawdzających poprawność zapytań, paginacji oraz walidacji parametrów.
6. **Dokumentacja:**
   - Aktualizacja dokumentacji API zgodnie z wprowadzonym endpointem.
7. **Monitoring i logowanie:**
   - Implementacja logów błędów oraz audytu dla operacji na folderach.
8. **Deploy:**
   - Wdrożenie zmiany do środowiska testowego, weryfikacja działania, a następnie deploy do produkcji.
