# Plan implementacji widoku ManualSave

## 1. Przegląd
Widok `ManualSave` umożliwia użytkownikom ręczne tworzenie pojedynczych fiszek i zapisywanie ich w istniejących lub nowo utworzonych folderach. Jest to kluczowa funkcja dla użytkowników, którzy chcą uzupełnić swoją bazę fiszek o treści, które nie zostały wygenerowane przez AI, lub wolą tradycyjną metodę tworzenia materiałów do nauki. Widok składa się z formularza do wprowadzania treści fiszki (przód i tył) oraz komponentu do wyboru folderu, który pozwala na wyszukiwanie, wybieranie istniejących folderów lub tworzenie nowych w locie.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/manual-save`. Strona ta będzie renderować główny komponent `ManualSaveView`, który zarządza całym procesem tworzenia fiszki.

## 3. Struktura komponentów
```
- ManualSaveView (Komponent główny strony)
  - ManualFlashcardForm (Formularz do tworzenia fiszki)
    - FolderSelect (Combobox do wyboru/tworzenia folderu)
    - Button (Przycisk do zapisu)
    - Textarea (Pola na przód i tył fiszki)
    - CharacterCounter (Licznik znaków dla pól tekstowych)
```

## 4. Szczegóły komponentów
### ManualSaveView
- **Opis komponentu:** Główny kontener widoku, który zarządza stanem całego procesu, obsługuje logikę pobierania danych, komunikację z API i koordynuje komponenty podrzędne.
- **Główne elementy:** Komponent `ManualFlashcardForm`.
- **Obsługiwane interakcje:** Inicjalizacja pobierania listy folderów użytkownika przy załadowaniu widoku.
- **Typy:** `Folder[]`, `CreateFlashcardCommand`.
- **Propsy:** Brak.

### ManualFlashcardForm
- **Opis komponentu:** Formularz React, który pozwala użytkownikowi na wprowadzenie danych nowej fiszki oraz wybór folderu. Zarządza stanem formularza, walidacją i obsługą zdarzenia zapisu.
- **Główne elementy:**
  - `FolderSelect` do wyboru folderu.
  - Dwa komponenty `Textarea` dla przodu i tyłu fiszki.
  - Dwa komponenty `CharacterCounter` powiązane z polami `Textarea`.
  - Komponent `Button` do wysłania formularza.
- **Obsługiwane interakcje:**
  - `onSubmit`: Uruchamia proces zapisu fiszki.
  - `onFieldChange`: Aktualizuje stan formularza przy zmianie wartości pól.
- **Obsługiwana walidacja:**
  - `front`: Wymagane, maksymalnie 200 znaków.
  - `back`: Wymagane, maksymalnie 500 znaków.
  - `folderId`: Wymagane, musi być wybranym lub nowo utworzonym folderem.
- **Typy:** `ManualFlashcardFormViewModel`, `Folder`.
- **Propsy:**
  - `folders: Folder[]`: Lista istniejących folderów użytkownika.
  - `onSave: (data: ManualFlashcardFormViewModel) => Promise<void>`: Funkcja zwrotna wywoływana przy zapisie.
  - `onCreateFolder: (name: string) => Promise<Folder>`: Funkcja do tworzenia nowego folderu.
  - `isLoading: boolean`: Informuje o stanie ładowania (np. podczas zapisu).

### FolderSelect
- **Opis komponentu:** Komponent `Combobox` (oparty na `shadcn/ui`), który umożliwia użytkownikom wyszukiwanie i wybieranie istniejącego folderu z listy lub wpisanie nazwy i utworzenie nowego.
- **Główne elementy:** `Command` (z `cmdk`), `Popover`, `Button` z `shadcn/ui`.
- **Obsługiwane interakcje:**
  - `onSelect`: Wywoływane, gdy użytkownik wybierze istniejący folder.
  - `onCreate`: Wywoływane, gdy użytkownik wpisze nową nazwę i zdecyduje się utworzyć folder.
- **Obsługiwana walidacja:** Nazwa nowego folderu musi mieć od 1 do 100 znaków.
- **Typy:** `Folder`.
- **Propsy:**
  - `folders: Folder[]`: Lista folderów do wyświetlenia.
  - `selectedFolder: Folder | null`: Aktualnie wybrany folder.
  - `onSelectFolder: (folder: Folder) => void`: Funkcja zwrotna po wyborze folderu.
  - `onCreateFolder: (name: string) => Promise<Folder>`: Funkcja do tworzenia nowego folderu.

## 5. Typy
### ManualFlashcardFormViewModel
Model widoku reprezentujący stan formularza do tworzenia fiszki.
```typescript
interface ManualFlashcardFormViewModel {
  front: string; // max 200 znaków
  back: string; // max 500 znaków
  folderId: string | null; // UUID wybranego folderu
  newFolderName: string; // Nazwa nowego folderu, jeśli jest tworzony
}
```

### Folder
Typ DTO pobierany z API, zdefiniowany w `src/types.ts`.
```typescript
// import type { Database } from './db/database.types';
// export type Folder = Database["public"]["Tables"]["folders"]["Row"]; 
// Struktura: { id, user_id, name, created_at, updated_at }
```

### CreateFlashcardCommand
Typ Command Modelu do tworzenia nowej fiszki, zdefiniowany w `src/types.ts`.
```typescript
// export type CreateFlashcardCommand = Pick<Flashcard, 'front' | 'back' | 'folder_id' | 'generation_source'>;
```

## 6. Zarządzanie stanem
Stan będzie zarządzany lokalnie w komponentach React przy użyciu hooków `useState` i `useEffect`.
- **`ManualSaveView`**:
  - `folders: Folder[]`: Przechowuje listę folderów użytkownika pobraną z API.
  - `isLoading: boolean`: Zarządza stanem ładowania podczas operacji asynchronicznych (pobieranie folderów, zapis fiszki).
  - `error: string | null`: Przechowuje komunikaty o błędach.
- **`ManualFlashcardForm`**:
  - `formData: ManualFlashcardFormViewModel`: Przechowuje aktualne wartości pól formularza.
  - `validationErrors: { [key: string]: string }`: Przechowuje błędy walidacji dla poszczególnych pól.
- **`FolderSelect`**:
  - `isOpen: boolean`: Stan otwarcia/zamknięcia `Combobox`.
  - `searchValue: string`: Wartość wpisywana w polu wyszukiwania.

Nie ma potrzeby tworzenia customowego hooka, ponieważ logika jest specyficzna dla tego widoku i nie jest skomplikowana.

## 7. Integracja API
Komponent `ManualSaveView` będzie odpowiedzialny za komunikację z API.
1.  **Pobieranie folderów:**
    - **Endpoint:** `GET /api/folders`
    - **Akcja:** Wywołanie przy pierwszym renderowaniu komponentu `ManualSaveView`.
    - **Parametry:** `user_id` (wymagany, UUID użytkownika).
    - **Typ odpowiedzi:** `{ folders: Folder[], pagination: { ... } }`
2.  **Tworzenie folderu:**
    - **Endpoint:** `POST /api/folders`
    - **Akcja:** Wywołanie z komponentu `FolderSelect`, gdy użytkownik chce utworzyć nowy folder.
    - **Typ żądania:** `CreateFolderCommand` (`{ name: string, user_id: string }`)
    - **Typ odpowiedzi:** `{ folder: Folder }`
3.  **Tworzenie fiszki:**
    - **Endpoint:** `POST /api/flashcards`
    - **Akcja:** Wywołanie po pomyślnej walidacji i wysłaniu formularza `ManualFlashcardForm`.
    - **Typ żądania:** `CreateFlashcardCommand` (`{ front, back, folder_id, generation_source: 'manual' }`)
    - **Typ odpowiedzi:** `{ flashcard: Flashcard }`

## 8. Interakcje użytkownika
- **Wprowadzanie tekstu:** Użytkownik wpisuje treść w polach "Front" i "Back". Liczniki znaków aktualizują się w czasie rzeczywistym.
- **Wybór folderu:** Użytkownik klika na `Combobox`, co rozwija listę folderów. Może przewijać, filtrować listę wpisując tekst, a następnie wybrać folder kliknięciem.
- **Tworzenie folderu:** Jeśli użytkownik nie znajdzie folderu, wpisuje jego nazwę i klika opcję "Utwórz nowy folder", co wywołuje `POST /api/folders`. Nowo utworzony folder jest automatycznie wybierany.
- **Zapis fiszki:** Użytkownik klika przycisk "Zapisz fiszkę". Przycisk jest aktywny tylko wtedy, gdy wszystkie wymagane pola są wypełnione i poprawne. Po kliknięciu dane są wysyłane do `POST /api/flashcards`.
- **Po zapisie:** Formularz jest czyszczony, a użytkownik otrzymuje powiadomienie (np. toast) o pomyślnym utworzeniu fiszki.

## 9. Warunki i walidacja
- **Przycisk "Zapisz fiszkę"**: Jest domyślnie nieaktywny (`disabled`). Staje się aktywny, gdy:
  - `formData.front` ma długość > 0 i <= 200.
  - `formData.back` ma długość > 0 i <= 500.
  - `formData.folderId` nie jest `null`.
- **Pole "Front"**: Walidacja w czasie rzeczywistym. Jeśli przekroczy 200 znaków, licznik zmienia kolor na czerwony, a pod polem pojawia się komunikat błędu.
- **Pole "Back"**: Walidacja w czasie rzeczywistym. Jeśli przekroczy 500 znaków, licznik zmienia kolor na czerwony, a pod polem pojawia się komunikat błędu.
- **`FolderSelect`**: Jeśli użytkownik próbuje utworzyć folder o nazwie, która już istnieje, powinien otrzymać stosowny komunikat błędu z API.

## 10. Obsługa błędów
- **Błąd pobierania folderów:** Jeśli `GET /api/folders` zwróci błąd, w miejscu `FolderSelect` powinien pojawić się komunikat o błędzie z opcją ponowienia próby.
- **Błąd tworzenia folderu:** Jeśli `POST /api/folders` zwróci błąd (np. zduplikowana nazwa), użytkownik powinien zobaczyć komunikat błędu wewnątrz komponentu `FolderSelect`.
- **Błąd zapisu fiszki:** Jeśli `POST /api/flashcards` zwróci błąd, formularz nie powinien być czyszczony, a nad przyciskiem zapisu powinien pojawić się ogólny komunikat o błędzie.
- **Brak folderów:** Jeśli użytkownik nie ma żadnych folderów, `FolderSelect` powinien wyświetlić zachętę do utworzenia pierwszego folderu.

## 11. Kroki implementacji
1.  **Utworzenie pliku strony:** Stwórz plik `src/pages/manual-save.astro`, który będzie renderował główny komponent React `ManualSaveView`.
2.  **Implementacja `ManualSaveView`:**
    - Stwórz komponent `src/components/views/ManualSaveView.tsx`.
    - Dodaj logikę pobierania folderów użytkownika przy użyciu `useEffect` i `fetch`.
    - Zarządzaj stanami `isLoading` i `error`.
3.  **Implementacja `ManualFlashcardForm`:**
    - Stwórz komponent `src/components/forms/ManualFlashcardForm.tsx`.
    - Zbuduj strukturę formularza przy użyciu komponentów `Textarea`, `Button` z `shadcn/ui`.
    - Zaimplementuj logikę walidacji i zarządzanie stanem formularza (`formData`).
4.  **Implementacja `FolderSelect`:**
    - Stwórz komponent `src/components/ui/FolderSelect.tsx`.
    - Zaimplementuj `Combobox` przy użyciu `Popover` i `Command` z `shadcn/ui` i `cmdk`.
    - Dodaj logikę wyszukiwania, wybierania i tworzenia nowego folderu.
5.  **Implementacja `CharacterCounter`:**
    - Stwórz prosty komponent `src/components/ui/CharacterCounter.tsx`, który przyjmuje `currentLength` i `maxLength` i wyświetla je, zmieniając kolor po przekroczeniu limitu.
6.  **Integracja komponentów:**
    - Złóż wszystkie komponenty w `ManualSaveView`.
    - Przekaż potrzebne propsy i funkcje zwrotne (`onSave`, `onCreateFolder`).
7.  **Obsługa zapisu:**
    - W `ManualSaveView` zaimplementuj funkcję `handleSave`, która będzie wywoływać `POST /api/flashcards`.
    - Po pomyślnym zapisie, wyczyść formularz i wyświetl powiadomienie (np. za pomocą biblioteki `sonner`).
8.  **Stylowanie i UI:**
    - Dopracuj wygląd widoku zgodnie z systemem designu opartym na Tailwind CSS i `shadcn/ui`.
    - Upewnij się, że wszystkie stany (ładowanie, błąd, sukces) są wizualnie reprezentowane.
9.  **Testowanie manualne:**
    - Przetestuj wszystkie ścieżki interakcji użytkownika, walidację i obsługę błędów.
