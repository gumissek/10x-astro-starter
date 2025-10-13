# Plan implementacji widoku: Generowanie fiszek AI

## 1. Przegląd
Celem tego widoku jest umożliwienie użytkownikom automatycznego generowania fiszek na podstawie wklejonego tekstu. Użytkownik wprowadza tekst, system generuje propozycje fiszek za pomocą AI, a następnie użytkownik może je przejrzeć, edytować, zaakceptować lub odrzucić przed zapisaniem w wybranym folderze. Widok ten ma na celu znaczące przyspieszenie procesu tworzenia materiałów do nauki.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/generate`

## 3. Struktura komponentów
Komponenty zostaną zaimplementowane w React i osadzone na stronie Astro. Hierarchia komponentów będzie wyglądać następująco:

```
- GenerateFlashcardsView (Komponent główny)
  - FlashcardGeneratorForm
    - Textarea (z licznikiem znaków)
    - Button ("Generuj")
  - LoadingSpinner (wyświetlany podczas generowania)
  - FlashcardProposalList
    - SuggestedFolderNameInput
    - FlashcardProposalCard (dla każdej propozycji)
      - CardHeader (z przyciskami Akceptuj/Odrzuć/Edytuj)
      - CardContent (z tekstem fiszki)
    - SaveFlashcardsSection
      - FolderSelect (Combobox do wyboru folderu)
      - Button ("Zapisz X fiszek")
  - EditFlashcardModal (modal do edycji fiszki)
```

## 4. Szczegóły komponentów

### GenerateFlashcardsView
- **Opis:** Główny kontener widoku, zarządzający stanem całego procesu generowania i zapisywania fiszek.
- **Główne elementy:** Renderuje warunkowo poszczególne komponenty podrzędne w zależności od etapu procesu (formularz, ładowanie, lista propozycji).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji, zarządza logiką i przepływem danych.
- **Typy:** `FlashcardProposalViewModel`, `Folder`.
- **Propsy:** Brak.

### FlashcardGeneratorForm
- **Opis:** Formularz do wprowadzania tekstu przez użytkownika.
- **Główne elementy:** `Textarea` (z `shadcn/ui`) do wprowadzania tekstu, licznik znaków, `Button` (`shadcn/ui`) do rozpoczęcia generowania.
- **Obsługiwane interakcje:** `onChange` na `Textarea` do aktualizacji tekstu i licznika, `onClick` na `Button` do wysłania żądania API.
- **Obsługiwana walidacja:** Długość tekstu (1-5000 znaków). Przycisk "Generuj" jest nieaktywny, jeśli walidacja nie przechodzi.
- **Typy:** Brak.
- **Propsy:** `onGenerate: (text: string) => void`, `isLoading: boolean`.

### FlashcardProposalList
- **Opis:** Wyświetla listę wygenerowanych propozycji fiszek oraz opcje zapisu.
- **Główne elementy:** Pole `Input` dla sugerowanej nazwy folderu, lista komponentów `FlashcardProposalCard`, sekcja zapisu z `FolderSelect` i przyciskiem.
- **Obsługiwane interakcje:** Edycja nazwy folderu, interakcje z kartami fiszek (przekazywane w górę), wybór folderu z `Combobox`, kliknięcie przycisku zapisu.
- **Typy:** `FlashcardProposalViewModel[]`, `Folder[]`.
- **Propsy:** `proposals: FlashcardProposalViewModel[]`, `suggestedFolderName: string`, `folders: Folder[]`, `onUpdateProposal: (updatedProposal: FlashcardProposalViewModel) => void`, `onSave: (folderId: string, folderName: string, acceptedFlashcards: FlashcardProposalViewModel[]) => void`.

### FlashcardProposalCard
- **Opis:** Karta reprezentująca pojedynczą propozycję fiszki.
- **Główne elementy:** Komponent `Card` z `shadcn/ui`. W nagłówku przyciski `Accept`, `Reject`, `Edit`. W treści `front` i `back` fiszki.
- **Obsługiwane interakcje:** Kliknięcie przycisków `Accept`, `Reject`, `Edit`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardProposalViewModel`.
- **Propsy:** `proposal: FlashcardProposalViewModel`, `onUpdate: (updatedProposal: FlashcardProposalViewModel) => void`.

## 5. Typy
Oprócz typów DTO (`GenerateFlashcardsResponseDTO`, `BulkSaveFlashcardsCommand`) z `src/types.ts`, wprowadzony zostanie nowy typ ViewModel do zarządzania stanem UI.

- **`FlashcardProposalViewModel`**
  ```typescript
  interface FlashcardProposalViewModel {
    id: string; // Unikalny identyfikator po stronie klienta (np. UUID)
    front: string;
    back: string;
    generation_source: 'ai';
    status: 'pending' | 'accepted' | 'rejected'; // Stan akceptacji przez użytkownika
  }
  ```
  - **`id`**: Kluczowy do renderowania list i identyfikacji fiszki podczas aktualizacji stanu.
  - **`status`**: Umożliwia filtrowanie zaakceptowanych fiszek, dynamiczne stylowanie kart i logikę przycisków.

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie zrealizowane za pomocą hooka `useState` w głównym komponencie `GenerateFlashcardsView`. Nie ma potrzeby tworzenia customowego hooka na tym etapie.

- **`text: string`**: Przechowuje zawartość `Textarea`.
- **`isLoading: boolean`**: Kontroluje wyświetlanie `LoadingSpinner`.
- **`suggestedFolderName: string`**: Przechowuje sugerowaną nazwę folderu z odpowiedzi API.
- **`proposals: FlashcardProposalViewModel[]`**: Lista propozycji fiszek wzbogacona o stan UI.
- **`folders: Folder[]`**: Lista istniejących folderów użytkownika, pobrana z API.
- **`error: string | null`**: Przechowuje komunikaty o błędach.

## 7. Integracja API
Widok będzie korzystał z dwóch głównych endpointów:

1.  **Generowanie fiszek:**
    - **Endpoint:** `POST /api/flashcards/generate`
    - **Typ żądania:** `GenerateFlashcardsCommand` (`{ text: string }`)
    - **Typ odpowiedzi (sukces):** `GenerateFlashcardsResponseDTO`
    - **Akcja:** Po pomyślnej odpowiedzi, dane są mapowane na `FlashcardProposalViewModel[]` i aktualizowany jest stan komponentu.

2.  **Zapisywanie fiszek:**
    - **Endpoint:** `POST /api/flashcards/bulk-save`
    - **Typ żądania:** `BulkSaveFlashcardsCommand`
    - **Typ odpowiedzi (sukces):** `{ success: boolean, message: string, saved_count: number, flashcard_ids: string[] }`
    - **Akcja:** Przed wysłaniem, stan `proposals` jest filtrowany, aby uzyskać tylko te z `status: 'accepted'`.

Dodatkowo, potrzebny będzie endpoint do pobrania listy folderów użytkownika (`GET /api/folders`), aby zasilić komponent `FolderSelect`.

## 8. Interakcje użytkownika
- **Wprowadzanie tekstu:** Użytkownik wpisuje tekst w `Textarea`, licznik znaków aktualizuje się na bieżąco.
- **Generowanie:** Kliknięcie "Generuj" (aktywnego po spełnieniu walidacji) uruchamia `isLoading` i wysyła żądanie do API.
- **Akceptacja/Odrzucenie:** Kliknięcie "Accept" lub "Reject" na karcie zmienia jej `status` w stanie i wygląd (np. kolor ramki).
- **Edycja:** Kliknięcie "Edit" otwiera modal z formularzem do edycji `front` i `back` danej propozycji. Zapisanie zmian aktualizuje stan.
- **Wybór folderu:** Użytkownik wybiera istniejący folder z `Combobox` lub pozostawia pole, aby utworzyć nowy folder o sugerowanej nazwie.
- **Zapis:** Kliknięcie "Zapisz X fiszek" filtruje zaakceptowane fiszki i wysyła je do endpointu `bulk-save`.

## 9. Warunki i walidacja
- **Formularz generowania (`FlashcardGeneratorForm`):**
  - Tekst musi mieć od 1 do 5000 znaków.
  - Przycisk "Generuj" jest nieaktywny (`disabled`), jeśli warunek nie jest spełniony.
- **Sekcja zapisu (`SaveFlashcardsSection`):**
  - Przycisk "Zapisz X fiszek" jest nieaktywny, jeśli liczba zaakceptowanych fiszek wynosi 0.
- **Edycja fiszki (`EditFlashcardModal`):**
  - `front`: max 200 znaków.
  - `back`: max 500 znaków.
  - Walidacja w czasie rzeczywistym z licznikami znaków.

## 10. Obsługa błędów
- **Błędy walidacji API (400):** Komunikaty o błędach (np. "Text cannot be empty") będą wyświetlane użytkownikowi w pobliżu formularza.
- **Błędy serwera (500):** Ogólny komunikat o błędzie ("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.") będzie wyświetlany w widocznym miejscu.
- **Błędy sieciowe:** Podobna obsługa jak w przypadku błędów serwera, z sugestią sprawdzenia połączenia internetowego.
- **Brak propozycji:** Jeśli API zwróci pustą tablicę `flashcards_proposals`, zostanie wyświetlony komunikat "Nie udało się wygenerować fiszek dla podanego tekstu. Spróbuj użyć innego fragmentu."

## 11. Kroki implementacji
1.  **Stworzenie pliku strony:** Utworzenie pliku `src/pages/generate.astro`.
2.  **Stworzenie głównego komponentu:** Utworzenie pliku `src/components/views/GenerateFlashcardsView.tsx` i osadzenie go w stronie Astro.
3.  **Implementacja formularza:** Stworzenie komponentu `FlashcardGeneratorForm.tsx` z `Textarea`, licznikiem znaków i logiką walidacji.
4.  **Integracja z API generowania:** Implementacja logiki wywołania `POST /api/flashcards/generate`, obsługa stanu ładowania i błędów.
5.  **Definicja ViewModel:** Zdefiniowanie typu `FlashcardProposalViewModel`.
6.  **Implementacja listy propozycji:** Stworzenie komponentów `FlashcardProposalList.tsx` i `FlashcardProposalCard.tsx` do wyświetlania wyników z API.
7.  **Implementacja logiki akceptacji:** Dodanie obsługi zdarzeń dla akceptacji, odrzucania i edycji propozycji, aktualizujących stan `proposals`.
8.  **Pobieranie folderów:** Implementacja pobierania listy folderów użytkownika i przekazanie jej do `FolderSelect`.
9.  **Integracja z API zapisu:** Implementacja logiki wywołania `POST /api/flashcards/bulk-save` po kliknięciu przycisku zapisu.
10. **Implementacja modala edycji:** Stworzenie komponentu `EditFlashcardModal.tsx` i integracja z logiką edycji.
11. **Styling i finalizacja:** Dopracowanie stylów za pomocą Tailwind CSS, zapewnienie responsywności i spójności z resztą aplikacji.
12. **Testowanie manualne:** Przetestowanie całego przepływu, włączając przypadki brzegowe i obsługę błędów.
