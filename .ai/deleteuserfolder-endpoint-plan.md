# API Endpoint Implementation Plan: Delete Folder

## 1. Przegląd punktu końcowego
Endpoint służy do usunięcia folderu wraz z kaskadowym usunięciem powiązanych fiszek. Usunięcie folderu jest możliwe wyłącznie dla właściciela, który potwierdza swój identyfikator użytkownika poprzez przekazanie parametru `user_id`.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** /folders/{folderId}
- **Parametry:**
  - **Wymagane:**
    - `folderId` (ścieżka): UUID folderu do usunięcia
    - `user_id` (query): UUID użytkownika potwierdzający posiadanie folderu
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **FolderDTO:** Do reprezentacji danych folderu w odpowiedziach (choć w przypadku DELETE możemy zwrócić jedynie komunikat potwierdzający operację).
- **CreateFolderCommand / UpdateFolderCommand:** Nie są wykorzystywane, ale pełnią rolę ujednolicenia typów w systemie.

## 4. Szczegóły odpowiedzi
- **200 OK:** Potwierdzenie pomyślnego usunięcia folderu.
- **404 Not Found:** Folder o podanym identyfikatorze nie istnieje lub nie należy do użytkownika.
- **400 Bad Request:** Błędne dane wejściowe, np. nieprawidłowy format UUID lub brak wymaganego parametru `user_id`.
- **500 Internal Server Error:** Błąd po stronie serwera podczas próby usunięcia folderu.

## 5. Przepływ danych
1. Odbiór identyfikatora folderu z parametru ścieżki oraz `user_id` z parametrów zapytania.
2. Walidacja formatów identyfikatorów (UUID) oraz obecności parametru `user_id`.
3. Sprawdzenie istnienia folderu w bazie danych i weryfikacja, czy folder należy do użytkownika.
4. Wywołanie logiki biznesowej odpowiedzialnej za usunięcie folderu, delegowanej do serwisu (np. `folderService`).
5. Kaskadowe usunięcie powiązanych fiszek realizowane przez mechanizm ON DELETE CASCADE w bazie.
6. Wysłanie odpowiedzi z potwierdzeniem (200 OK) lub odpowiednim komunikatem błędu.

## 6. Względy bezpieczeństwa
- Weryfikacja tożsamości użytkownika poprzez przekazaną wartość `user_id` oraz porównanie jej z wartością zapisaną w bazie.
- Walidacja formatu identyfikatorów (UUID) aby zapobiec atakom typu injection.
- Użycie mechanizmu autoryzacji Supabase w celu zapewnienia, że użytkownik ma prawo do usunięcia danego folderu.

## 7. Obsługa błędów
- **Błąd 400 (Bad Request):** Brak `user_id` lub nieprawidłowy format UUID.
- **Błąd 404 (Not Found):** Brak folderu lub folder nie jest przypisany do wskazanego użytkownika.
- **Błąd 500 (Internal Server Error):** Nieoczekiwane błędy podczas przetwarzania żądania (np. błędy w połączeniu z bazą danych).
- W logowaniu błędów należy zapisywać dodatkowe informacje diagnostyczne, zachowując jednocześnie poufność danych użytkowników.

## 8. Rozważania dotyczące wydajności
- Wykorzystanie indeksów na polach `id` oraz `user_id` w tabeli `folders` zapewni szybkie wyszukiwanie folderów.
- Kaskadowe usunięcie fiszek odbywa się bez dodatkowych zapytań dzięki mechanizmowi ON DELETE CASCADE w bazie danych, co minimalizuje obciążenie aplikacji.

## 9. Etapy wdrożenia
1. **Przygotowanie walidacji:** 
   - Upewnić się, że identyfikatory (folderId, user_id) są poprawnymi UUID.
   - Wdrożyć odpowiednią logikę walidacyjną w middleware lub kontrolerze endpointu.
2. **Implementacja logiki biznesowej:** 
   - Dodanie metody `deleteFolder` w serwisie (np. w `src/lib/services/folderService.ts`), która wykonuje operację usunięcia folderu z uwzględnieniem walidacji właściciela.
3. **Integracja z trasą API:** 
   - Utworzyć nową trasę/wzorca pliku w katalogu `src/pages/api/folders/[folderId].ts` z metodą DELETE.
   - Delegować operację do serwisu, obsłużyć walidację oraz odpowiadać odpowiednimi kodami statusu.
4. **Testy modułowe:** 
   - Przygotować testy sprawdzające pomyślne usunięcie folderu oraz przypadki błędne (brak folderu, błędny `user_id`, niepoprawny format UUID).
5. **Logowanie i monitoring:** 
   - Dodać logowanie operacji oraz ewentualnych błędów.
6. **Dokumentacja:** 
   - Zaktualizować dokumentację API (jeśli dotyczy) oraz poinformować zespół o zmianach.

## 10. Referencje do reguł implementacji
- @shared.mdc
- @backend.mdc
- @astro.mdc
