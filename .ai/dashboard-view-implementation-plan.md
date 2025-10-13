# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard (`/dashboard`) jest centralnym punktem aplikacji, który umożliwia użytkownikom zarządzanie folderami z fiszkami. Głównym celem widoku jest wyświetlenie siatki wszystkich folderów użytkownika, prezentując ich nazwy oraz liczbę zawartych w nich fiszek. Widok ten stanowi również punkt wyjścia do kluczowych akcji, takich jak generowanie nowych fiszek, manualne dodawanie fiszek oraz zarządzanie poszczególnymi folderami (edycja nazwy, usuwanie).

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/dashboard`

Strona zostanie zaimplementowana jako plik `src/pages/dashboard.astro`.

## 3. Struktura komponentów
Hierarchia komponentów dla widoku Dashboard będzie wyglądać następująco:

```
DashboardView (React, Client-side)
├── Header
│   ├── Title ("Twoje foldery")
│   └── ActionButtons
│       ├── Button ("Generuj fiszki") -> nawigacja do /generate
│       └── Button ("Dodaj fiszkę") -> nawigacja do /manual-save
├── FolderGrid
│   ├── FolderCard (mapowanie po liście folderów)
│   │   ├── CardHeader (Nazwa folderu)
│   │   ├── CardContent (Liczba fiszek)
│   │   └── CardFooter
│   │       └── FolderActions
│   │           └── DropdownMenu
│   │               ├── DropdownMenuItem ("Edytuj")
│   │               └── DropdownMenuItem ("Usuń")
│   └── FolderCardSkeleton (wyświetlane podczas ładowania)
└── EditFolderDialog (Modal do edycji nazwy folderu)
└── DeleteFolderDialog (Modal do potwierdzenia usunięcia folderu)
```

## 4. Szczegóły komponentów

### `DashboardView` (Komponent główny)
- **Opis:** Główny kontener widoku, który zarządza stanem, pobiera dane i koordynuje interakcje między komponentami podrzędnymi.
- **Główne elementy:** `div` jako kontener, komponenty `Header`, `FolderGrid`, `EditFolderDialog`, `DeleteFolderDialog`.
- **Obsługiwane interakcje:** Inicjalizacja pobierania danych o folderach przy montowaniu komponentu.
- **Typy:** `FolderViewModel[]`, `string | null` (dla ID folderu do edycji/usunięcia).
- **Propsy:** Brak.

### `FolderGrid`
- **Opis:** Komponent odpowiedzialny za wyświetlanie siatki folderów lub komponentów `Skeleton` w trakcie ładowania danych.
- **Główne elementy:** `div` z klasami Tailwind CSS do tworzenia siatki (`grid`, `grid-cols-*`, `gap-*`).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Typy:** `FolderViewModel[]`.
- **Propsy:**
  - `folders: FolderViewModel[]`
  - `isLoading: boolean`
  - `onEdit: (folderId: string) => void`
  - `onDelete: (folderId: string) => void`

### `FolderCard`
- **Opis:** Reprezentuje pojedynczy folder w siatce. Wyświetla jego nazwę, liczbę fiszek oraz menu akcji.
- **Główne elementy:** Komponent `Card` z `shadcn/ui`, zawierający `CardHeader`, `CardContent`, `CardFooter` oraz `DropdownMenu`.
- **Obsługiwane interakcje:** Kliknięcie opcji "Edytuj" lub "Usuń" w menu.
- **Typy:** `FolderViewModel`.
- **Propsy:**
  - `folder: FolderViewModel`
  - `onEdit: (folderId: string) => void`
  - `onDelete: (folderId: string) => void`

### `EditFolderDialog`
- **Opis:** Modal z formularzem do edycji nazwy istniejącego folderu.
- **Główne elementy:** Komponent `Dialog` z `shadcn/ui`, zawierający `form`, `Input` do nowej nazwy i `Button` do zapisu.
- **Obsługiwane interakcje:** Wprowadzanie tekstu, walidacja na żywo, przesyłanie formularza.
- **Warunki walidacji:**
  - Nazwa folderu jest wymagana.
  - Nazwa folderu nie może być pusta ani składać się tylko z białych znaków.
  - Nazwa folderu nie może przekraczać 100 znaków.
- **Typy:** `FolderViewModel`.
- **Propsy:**
  - `isOpen: boolean`
  - `folder: FolderViewModel | null`
  - `onClose: () => void`
  - `onSave: (folderId: string, newName: string) => Promise<void>`

### `DeleteFolderDialog`
- **Opis:** Modal z prośbą o potwierdzenie usunięcia folderu.
- **Główne elementy:** Komponent `Dialog` z `shadcn/ui`, zawierający tekst ostrzegawczy i przyciski "Anuluj" oraz "Usuń".
- **Obsługiwane interakcje:** Kliknięcie przycisku "Usuń" w celu potwierdzenia.
- **Typy:** `FolderViewModel`.
- **Propsy:**
  - `isOpen: boolean`
  - `folder: FolderViewModel | null`
  - `onClose: () => void`
  - `onConfirm: (folderId: string) => Promise<void>`

## 5. Typy

Do implementacji widoku wymagany będzie nowy typ `ViewModel`, który połączy dane z dwóch różnych endpointów (`GET /folders` i `GET /folders/{folderId}`).

```typescript
// src/types.ts

// ... istniejące typy

// ViewModel dla folderu, używany w widoku Dashboard.
// Łączy podstawowe dane folderu z liczbą fiszek.
export interface FolderViewModel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie zrealizowane przy użyciu hooków React (`useState`, `useEffect`). Ze względu na złożoność operacji (pobieranie danych, edycja, usuwanie, obsługa modali) zalecane jest stworzenie dedykowanego custom hooka `useDashboardState`.

### `useDashboardState`
- **Cel:** Hermetyzacja logiki zarządzania stanem folderów, ładowaniem, błędami oraz interakcjami z API.
- **Zarządzane stany:**
  - `folders: FolderViewModel[]`: Lista folderów do wyświetlenia.
  - `isLoading: boolean`: Status ładowania danych.
  - `error: string | null`: Komunikaty o błędach.
  - `editingFolder: FolderViewModel | null`: Folder aktualnie edytowany.
  - `deletingFolder: FolderViewModel | null`: Folder przeznaczony do usunięcia.
- **Zwracane wartości i funkcje:**
  - `folders`, `isLoading`, `error`
  - `handleEdit`, `handleDelete` (funkcje do otwierania modali)
  - `handleCloseDialogs` (funkcja do zamykania modali)
  - `handleSaveChanges` (funkcja do zapisu zmian w nazwie folderu)
  - `handleConfirmDelete` (funkcja do potwierdzenia usunięcia)

## 7. Integracja API
Integracja z API będzie obejmować wywołania do trzech endpointów. Wszystkie operacje wymagają `user_id`.

1.  **Pobieranie folderów (N+1 zapytań):**
    - **Krok 1: Pobranie listy folderów**
      - **Endpoint:** `GET /api/folders`
      - **Parametry:** `user_id`, `limit` (ustawiony na wysoką wartość, np. 100, aby uniknąć paginacji).
      - **Odpowiedź:** `Folder[]`
    - **Krok 2: Pobranie liczby fiszek dla każdego folderu**
      - **Endpoint:** `GET /api/folders/{folderId}` (wywoływany w pętli dla każdego folderu z kroku 1)
      - **Parametry:** `user_id`.
      - **Odpowiedź:** `FolderDTO` (z polem `flashcard_count`).
    - **Wynik:** Połączenie danych w tablicę `FolderViewModel[]`.

2.  **Aktualizacja folderu:**
    - **Endpoint:** `PUT /api/folders/{folderId}`
    - **Parametry:** `user_id`.
    - **Ciało żądania (`UpdateFolderCommand`):** `{ "name": "Nowa nazwa" }`
    - **Odpowiedź:** Zaktualizowany obiekt `Folder`.

3.  **Usuwanie folderu:**
    - **Endpoint:** `DELETE /api/folders/{folderId}`
    - **Parametry:** `user_id`.
    - **Odpowiedź:** Potwierdzenie usunięcia.

## 8. Interakcje użytkownika
- **Wejście na stronę:** Aplikacja automatycznie pobiera listę folderów i wyświetla `Skeleton` w trakcie ładowania.
- **Kliknięcie "Generuj fiszki":** Przekierowanie na stronę `/generate`.
- **Kliknięcie "Dodaj fiszkę":** Przekierowanie na stronę `/manual-save`.
- **Kliknięcie "Edytuj" na karcie folderu:** Otwiera się modal `EditFolderDialog` z aktualną nazwą w formularzu.
- **Zapis w modalu edycji:** Wywołanie API `PUT`, a po sukcesie aktualizacja stanu i zamknięcie modala.
- **Kliknięcie "Usuń" na karcie folderu:** Otwiera się modal `DeleteFolderDialog` z prośbą o potwierdzenie.
- **Potwierdzenie usunięcia:** Wywołanie API `DELETE`, a po sukcesie usunięcie folderu ze stanu i zamknięcie modala.

## 9. Warunki i walidacja
- **Formularz edycji nazwy folderu (`EditFolderDialog`):**
  - Przycisk "Zapisz" jest nieaktywny, jeśli pole nazwy jest puste, zawiera tylko białe znaki lub przekracza 100 znaków.
  - Walidacja odbywa się w czasie rzeczywistym, informując użytkownika o błędach.
- **Dostęp do akcji:** Wszystkie akcje (edycja, usuwanie) są dostępne tylko dla zalogowanego użytkownika, którego `user_id` jest używane w zapytaniach API.

## 10. Obsługa błędów
- **Błąd pobierania danych:** Jeśli którekolwiek z zapytań API zawiedzie, w miejscu siatki folderów zostanie wyświetlony komunikat o błędzie z przyciskiem "Spróbuj ponownie".
- **Błąd zapisu/usunięcia:** W przypadku błędu API podczas edycji lub usuwania, wewnątrz modala zostanie wyświetlony komunikat o błędzie (np. "Nie udało się zapisać zmian. Spróbuj ponownie.").
- **Brak folderów:** Jeśli użytkownik nie ma żadnych folderów, zamiast siatki zostanie wyświetlony komunikat informacyjny z zachętą do dodania pierwszego folderu lub wygenerowania fiszek.
- **Stan ładowania:** Komponenty `Skeleton` będą używane, aby zapobiec wrażeniu "pustej" strony podczas inicjalnego ładowania danych.

## 11. Kroki implementacji
1.  **Utworzenie pliku strony:** Stwórz plik `src/pages/dashboard.astro`.
2.  **Implementacja komponentu `DashboardView`:** Stwórz główny komponent React (`src/components/views/DashboardView.tsx`), który będzie renderowany w pliku `.astro` z dyrektywą `client:load`.
3.  **Stworzenie custom hooka `useDashboardState`:** Zaimplementuj logikę zarządzania stanem, w tym funkcje do interakcji z API.
4.  **Implementacja pobierania danych:** W `useDashboardState` zaimplementuj logikę pobierania folderów (N+1 zapytań) przy użyciu `useEffect`.
5.  **Stworzenie komponentów UI:**
    - Zaimplementuj `FolderGrid.tsx`, `FolderCard.tsx` oraz `FolderCardSkeleton.tsx`.
    - Wykorzystaj komponenty `shadcn/ui` (`Card`, `DropdownMenu`, `Skeleton`).
6.  **Implementacja modali:**
    - Stwórz `EditFolderDialog.tsx` z formularzem i logiką walidacji.
    - Stwórz `DeleteFolderDialog.tsx` z logiką potwierdzenia.
7.  **Połączenie komponentów:** Zintegruj wszystkie komponenty w `DashboardView`, przekazując odpowiednie propsy i funkcje obsługi zdarzeń z `useDashboardState`.
8.  **Nawigacja:** Dodaj linki (`<a>`) do przycisków "Generuj fiszki" i "Dodaj fiszkę", kierujące do odpowiednich podstron.
9.  **Obsługa błędów i stanów krańcowych:** Zaimplementuj wyświetlanie komunikatów o błędach, stanu ładowania oraz widoku dla użytkownika bez folderów.
10. **Testowanie:** Przetestuj manualnie wszystkie ścieżki interakcji użytkownika, w tym pomyślne operacje, błędy walidacji i błędy API.
