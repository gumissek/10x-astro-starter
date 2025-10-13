# Plan implementacji widoku Folder

## 1. Przegląd
Widok `Folder` ma na celu wyświetlenie szczegółowej listy fiszek należących do konkretnego folderu. Umożliwi użytkownikom przeglądanie zawartości folderu, inicjowanie sesji nauki, a także zarządzanie poszczególnymi fiszkami (edycja, usuwanie). Widok będzie dynamicznie pobierał dane z API i obsługiwał paginację dla zapewnienia wydajności przy dużej liczbie fiszek.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką, która zawiera identyfikator folderu.
- **Ścieżka:** `/folders/[folderId]`
- **Plik:** `src/pages/folders/[folderId].astro`

## 3. Struktura komponentów
Hierarchia komponentów dla widoku `Folder` będzie zorganizowana w następujący sposób, aby zapewnić reużywalność i separację logiki.

```
- FolderView (Komponent główny, kontener widoku)
  - Header
    - FolderName (Wyświetla nazwę folderu)
    - StudyButton (Przycisk "Ucz się z tego folderu")
  - FlashcardList
    - FlashcardListItem (Reprezentuje pojedynczą fiszkę)
      - FlashcardContent (Wyświetla przód i tył fiszki)
      - OriginIcon (Ikona wskazująca pochodzenie: AI/manual)
      - ActionsDropdown (Menu z opcjami: Edytuj, Usuń)
    - PaginationControls (Przyciski do nawigacji między stronami)
  - EditFlashcardDialog (Modal do edycji fiszki)
  - DeleteFlashcardDialog (Modal do potwierdzenia usunięcia fiszki)
  - LoadingSpinner (Wskaźnik ładowania danych)
  - ErrorDisplay (Komponent do wyświetlania błędów)
```

## 4. Szczegóły komponentów

### FolderView
- **Opis:** Główny kontener widoku, który zarządza stanem, pobiera dane folderu i listy fiszek, oraz koordynuje interakcje między komponentami podrzędnymi.
- **Główne elementy:** `div` jako kontener, `Header`, `FlashcardList`, `LoadingSpinner`, `ErrorDisplay`, `EditFlashcardDialog`, `DeleteFlashcardDialog`.
- **Obsługiwane interakcje:** Inicjalizacja pobierania danych przy załadowaniu widoku, obsługa zmiany strony w paginacji.
- **Typy:** `FolderViewModel`, `FlashcardViewModel`.
- **Propsy:** `folderId: string` (z parametrów URL).

### FlashcardList
- **Opis:** Komponent odpowiedzialny za renderowanie listy fiszek oraz kontrolek paginacji.
- **Główne elementy:** `div` lub `ul` jako kontener listy, iteracja po `FlashcardListItem`, `PaginationControls`.
- **Obsługiwane interakcje:** Przekazywanie zdarzeń edycji i usunięcia fiszki do `FolderView`.
- **Typy:** `FlashcardViewModel[]`, `Pagination`.
- **Propsy:** `flashcards: FlashcardViewModel[]`, `pagination: Pagination`, `onPageChange: (page: number) => void`, `onEdit: (flashcard: FlashcardViewModel) => void`, `onDelete: (flashcard: FlashcardViewModel) => void`.

### FlashcardListItem
- **Opis:** Reprezentuje pojedynczy element na liście fiszek. Wyświetla treść fiszki i dostępne akcje.
- **Główne elementy:** `div` (karta), `FlashcardContent`, `OriginIcon`, `ActionsDropdown`.
- **Obsługiwane interakcje:** Wywołanie zdarzeń `onEdit` i `onDelete` po kliknięciu odpowiednich opcji w menu.
- **Typy:** `FlashcardViewModel`.
- **Propsy:** `flashcard: FlashcardViewModel`, `onEdit: (flashcard: FlashcardViewModel) => void`, `onDelete: (flashcard: FlashcardViewModel) => void`.

### EditFlashcardDialog
- **Opis:** Modal z formularzem do edycji treści wybranej fiszki.
- **Główne elementy:** Komponent `Dialog` z `shadcn/ui`, `form` z polami `Input` (front) i `Textarea` (back), `CharacterCounter`.
- **Obsługiwane interakcje:** Wprowadzanie tekstu, walidacja na żywo, wysłanie formularza.
- **Warunki walidacji:**
  - `front`: wymagane, max 200 znaków.
  - `back`: wymagane, max 500 znaków.
- **Typy:** `FlashcardViewModel`, `UpdateFlashcardCommand`.
- **Propsy:** `isOpen: boolean`, `flashcard: FlashcardViewModel | null`, `onClose: () => void`, `onSave: (command: UpdateFlashcardCommand) => void`.

### DeleteFlashcardDialog
- **Opis:** Modal z prośbą o potwierdzenie operacji usunięcia fiszki.
- **Główne elementy:** Komponent `Dialog` z `shadcn/ui`, tekst potwierdzenia, przyciski "Usuń" i "Anuluj".
- **Obsługiwane interakcje:** Potwierdzenie lub anulowanie usunięcia.
- **Typy:** `FlashcardViewModel`.
- **Propsy:** `isOpen: boolean`, `flashcard: FlashcardViewModel | null`, `onClose: () => void`, `onConfirm: (flashcardId: string) => void`.

## 5. Typy
Do implementacji widoku wymagane będą następujące modele widoku (ViewModel), które rozszerzają istniejące typy DTO o dane potrzebne w UI.

### FolderViewModel
Łączy dane folderu z liczbą fiszek.
```typescript
export interface FolderViewModel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}
```

### FlashcardViewModel
Reprezentuje fiszkę w interfejsie użytkownika.
```typescript
export interface FlashcardViewModel {
  id: string;
  front: string;
  back: string;
  generation_source: 'ai' | 'manual';
  folder_id: string;
  created_at: string;
  updated_at: string;
}
```

### Pagination
Struktura danych dla paginacji.
```typescript
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie zrealizowane za pomocą customowego hooka `useFolderState` wewnątrz komponentu `FolderView`. Hook ten będzie odpowiedzialny za:
- Przechowywanie stanu ładowania (`isLoading`) i błędów (`error`).
- Przechowywanie danych folderu (`folder: FolderViewModel | null`).
- Przechowywanie listy fiszek (`flashcards: FlashcardViewModel[]`) i danych paginacji (`pagination: Pagination | null`).
- Zarządzanie stanem modali (np. `editingFlashcard: FlashcardViewModel | null`).
- Hermetyzację logiki pobierania danych, edycji, usuwania i paginacji.

## 7. Integracja API
Integracja z backendem będzie opierać się na wywołaniach do istniejących endpointów API.

- **Pobieranie danych folderu:**
  - **Akcja:** `useEffect` w `useFolderState` przy montowaniu komponentu.
  - **Endpoint:** `GET /api/folders/{folderId}`
  - **Typ odpowiedzi:** `FolderViewModel`

- **Pobieranie listy fiszek:**
  - **Akcja:** `useEffect` w `useFolderState` (po pobraniu danych folderu) oraz przy zmianie strony.
  - **Endpoint:** `GET /api/flashcards`
  - **Parametry:** `folderId`, `page`, `limit`.
  - **Typ odpowiedzi:** `{ flashcards: FlashcardViewModel[], pagination: Pagination }`

- **Aktualizacja fiszki:**
  - **Akcja:** Wywołanie funkcji `updateFlashcard` z `useFolderState` po zapisaniu formularza w `EditFlashcardDialog`.
  - **Endpoint:** `PUT /api/flashcards/{flashcardId}`
  - **Typ żądania:** `UpdateFlashcardCommand`
  - **Typ odpowiedzi:** `FlashcardViewModel`

- **Usuwanie fiszki:**
  - **Akcja:** Wywołanie funkcji `deleteFlashcard` z `useFolderState` po potwierdzeniu w `DeleteFlashcardDialog`.
  - **Endpoint:** `DELETE /api/flashcards/{flashcardId}`
  - **Typ odpowiedzi:** Potwierdzenie sukcesu (np. status 204).

## 8. Interakcje użytkownika
- **Wejście na stronę:** Użytkownik wchodzi na `/folders/[folderId]`. Aplikacja wyświetla `LoadingSpinner`, pobiera dane folderu i pierwszą stronę fiszek, a następnie renderuje widok.
- **Zmiana strony:** Użytkownik klika przycisk paginacji. Aplikacja pobiera i wyświetla odpowiednią stronę fiszek.
- **Edycja fiszki:** Użytkownik klika "Edytuj" w menu fiszki. Otwiera się `EditFlashcardDialog` z załadowanymi danymi. Po zapisaniu zmian, modal się zamyka, a lista fiszek jest odświeżana.
- **Usuwanie fiszki:** Użytkownik klika "Usuń". Otwiera się `DeleteFlashcardDialog`. Po potwierdzeniu, fiszka jest usuwana z bazy danych, a lista jest odświeżana.

## 9. Warunki i walidacja
- **Formularz edycji (`EditFlashcardDialog`):**
  - Pole `front` nie może być puste i nie może przekraczać 200 znaków.
  - Pole `back` nie może być puste i nie może przekraczać 500 znaków.
  - Przycisk "Zapisz" jest nieaktywny, dopóki formularz nie jest poprawny.
  - Liczniki znaków aktualizują się w czasie rzeczywistym.
- **Dostęp do folderu:** Logika po stronie serwera (API) weryfikuje, czy zalogowany użytkownik ma uprawnienia do folderu o podanym `folderId`. Frontend powinien obsłużyć błąd 403/404.

## 10. Obsługa błędów
- **Błąd pobierania danych (np. folder nie istnieje, błąd serwera):** Widok wyświetli komponent `ErrorDisplay` z odpowiednim komunikatem i ewentualnie przyciskiem do ponowienia próby.
- **Błąd walidacji API (np. przy edycji):** Komunikaty błędów z API zostaną wyświetlone pod odpowiednimi polami formularza w `EditFlashcardDialog`.
- **Błąd sieci:** Globalny system powiadomień (np. toasty) poinformuje użytkownika o problemie z połączeniem.
- **Stan pusty:** Jeśli folder nie zawiera żadnych fiszek, zostanie wyświetlony komunikat informujący o braku danych, np. "Ten folder jest pusty. Dodaj nowe fiszki!".

## 11. Kroki implementacji
1. **Stworzenie pliku routingu:** Utworzenie pliku `src/pages/folders/[folderId].astro`.
2. **Implementacja komponentu `FolderView`:** Stworzenie głównego komponentu `FolderView.tsx`, który będzie renderowany przez plik `.astro` i przyjmie `folderId` jako prop.
3. **Stworzenie customowego hooka `useFolderState`:** Zaimplementowanie logiki zarządzania stanem, w tym `isLoading`, `error`, `folder`, `flashcards` i `pagination`.
4. **Integracja z API:** Dodanie w hooku funkcji do pobierania danych folderu i listy fiszek z obsługą paginacji.
5. **Stworzenie komponentów listy:** Implementacja `FlashcardList.tsx` i `FlashcardListItem.tsx` do wyświetlania danych.
6. **Implementacja modali:** Stworzenie komponentów `EditFlashcardDialog.tsx` i `DeleteFlashcardDialog.tsx` wraz z formularzami i logiką walidacji.
7. **Dodanie akcji edycji i usuwania:** Zintegrowanie modali z `FolderView` poprzez `useFolderState`, dodanie funkcji `updateFlashcard` i `deleteFlashcard` w hooku, które będą komunikować się z API.
8. **Obsługa stanów UI:** Implementacja wyświetlania `LoadingSpinner` i `ErrorDisplay` w zależności od stanu aplikacji.
9. **Stylowanie:** Ostylowanie wszystkich komponentów przy użyciu Tailwind CSS i komponentów `shadcn/ui` zgodnie z designem aplikacji.
10. **Testowanie manualne:** Weryfikacja wszystkich interakcji użytkownika, obsługi błędów i przypadków brzegowych.
