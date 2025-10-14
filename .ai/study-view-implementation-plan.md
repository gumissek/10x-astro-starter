# Plan implementacji widoku Sesji Nauki

## 1. Przegląd
Widok Sesji Nauki (`/study`) to interaktywny interfejs umożliwiający użytkownikom naukę z wykorzystaniem fiszek z wybranego folderu. Celem jest zapewnienie minimalistycznego, skoncentrowanego na nauce środowiska, gdzie użytkownik może przeglądać fiszki, "odwracać" je, aby zobaczyć odpowiedź, i oceniać swoją znajomość, co pozwala na śledzenie postępów w czasie rzeczywistym.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/study/[folderId]`. Parametr `folderId` jest identyfikatorem UUID folderu, z którego mają być pobrane fiszki do sesji.

## 3. Struktura komponentów
Hierarchia komponentów dla widoku sesji nauki będzie następująca:

```
/pages/study/[folderId].astro
└── /components/views/StudySessionView.tsx (client:load)
    ├── /components/ui/LoadingSpinnerStudy.tsx
    ├── /components/ui/StudyFlashcard.tsx
    │   └── /components/ui/Button.tsx (do odwracania karty)
    ├── /components/ui/StudyControls.tsx
    │   ├── /components/ui/Button.tsx ("Nie znam")
    │   └── /components/ui/Button.tsx ("Znam")
    └── /components/ui/StudyProgress.tsx
        └── /components/ui/Progress.tsx (z biblioteki shadcn/ui)
```

## 4. Szczegóły komponentów

### `StudySessionView.tsx`
- **Opis komponentu:** Główny kontener widoku, który zarządza stanem całej sesji nauki. Odpowiada za pobieranie fiszek, obsługę logiki przechodzenia między nimi i renderowanie odpowiednich komponentów podrzędnych.
- **Główne elementy:** Wyświetla `LoadingSpinnerStudy` podczas ładowania danych. Po załadowaniu renderuje `StudyFlashcard` z aktualną fiszką, `StudyControls` do interakcji oraz `StudyProgress` do wizualizacji postępu.
- **Obsługiwane interakcje:**
  - Pobieranie fiszek po zamontowaniu komponentu.
  - Obsługa kliknięć przycisków "Znam" / "Nie znam" i aktualizacja stanu sesji.
- **Warunki walidacji:** Brak bezpośredniej walidacji; komponent polega na poprawnym `folderId` z URL.
- **Typy:** `StudySessionViewModel`, `FlashcardViewModel`.
- **Propsy:** `folderId: string`.

### `StudyFlashcard.tsx`
- **Opis komponentu:** Interaktywna karta fiszki, która może być "odwrócona", aby pokazać przód lub tył.
- **Główne elementy:** Kontener `div` stylizowany na kartę, zawierający tekst przodu i tyłu fiszki oraz przycisk do jej odwrócenia.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Odwróć" zmienia stan `isFlipped` i pokazuje drugą stronę karty.
- **Warunki walidacji:** Brak.
- **Typy:** `FlashcardViewModel`.
- **Propsy:** `flashcard: FlashcardViewModel`.

### `StudyControls.tsx`
- **Opis komponentu:** Zestaw przycisków umożliwiających użytkownikowi ocenę znajomości fiszki.
- **Główne elementy:** Dwa komponenty `Button`: "Nie znam" i "Znam".
- **Obsługiwane interakcje:**
  - `onKnowClick`: Wywoływane po kliknięciu "Znam".
  - `onDontKnowClick`: Wywoływane po kliknięciu "Nie znam".
- **Warunki walidacji:** Przyciski są aktywne, gdy sesja jest w toku.
- **Typy:** Brak specyficznych typów.
- **Propsy:** `onKnowClick: () => void`, `onDontKnowClick: () => void`.

### `StudyProgress.tsx`
- **Opis komponentu:** Wizualizuje postęp sesji nauki.
- **Główne elementy:** Wykorzystuje komponent `Progress` z `shadcn/ui` do pokazania paska postępu oraz wyświetla tekstowy licznik (np. "5/20").
- **Obsługiwane interakcje:** Brak.
- **Warunki walidacji:** Brak.
- **Typy:** Brak specyficznych typów.
- **Propsy:** `current: number`, `total: number`.

## 5. Typy
Do implementacji widoku wymagany będzie nowy typ `ViewModel`:

**`StudySessionViewModel`**
Zarządza stanem interfejsu użytkownika podczas sesji nauki.
- `flashcards: FlashcardViewModel[]`: Lista fiszek pobranych z API do bieżącej sesji.
- `currentCardIndex: number`: Indeks aktualnie wyświetlanej fiszki w tablicy `flashcards`.
- `knownFlashcards: number`: Liczba fiszek oznaczonych jako "Znam".
- `status: 'loading' | 'studying' | 'finished'`: Status sesji, kontrolujący co jest wyświetlane na ekranie (ładowanie, nauka, podsumowanie).
- `error: string | null`: Przechowuje komunikaty o błędach, jeśli wystąpią podczas pobierania danych.

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany lokalnie w komponencie `StudySessionView.tsx` za pomocą hooka `useState` z Reacta. Nie ma potrzeby tworzenia customowego hooka, ponieważ logika jest zamknięta w obrębie jednego widoku. Główny obiekt stanu będzie zgodny ze zdefiniowanym `StudySessionViewModel`.

## 7. Integracja API
Integracja opiera się na jednym punkcie końcowym API: `GET /api/flashcards`.
- **Akcja:** Po załadowaniu komponentu `StudySessionView.tsx` zostanie wykonane żądanie `fetch` do `/api/flashcards`.
- **Żądanie:**
  - URL: `/api/flashcards?folderId={folderId}&limit=1000` (ustawiamy duży limit, aby pobrać wszystkie fiszki z folderu), a nastepnie wybrać losowe 20 fiszek do sesji. 
  - Metoda: `GET`.
- **Odpowiedź (sukces):**
  - Status: `200 OK`.
  - Ciało (`FlashcardsApiResponse`):
    ```json
    {
      "flashcards": [
        {
          "id": "<UUID>",
          "front": "Text",
          "back": "Text",
          "folder_id": "<UUID>",
          "generation_source": "ai or manual",
          "created_at": "...",
          "updated_at": "..."
        }
      ],
      "pagination": { "page": 1, "limit": 1000, "total": 20, "totalPages": 1 }
    }
    ```
- **Odpowiedź (błąd):**
  - Status: `404 Not Found` (np. gdy folder nie istnieje), `500 Internal Server Error`.
  - Ciało: `{ "error": "Komunikat błędu" }`.

## 8. Interakcje użytkownika
- **Rozpoczęcie sesji:** Użytkownik klika przycisk "Rozpocznij naukę" w widoku folderu (`/folders/[folderId]`) lub na pulpicie (`/dashboard`), co przekierowuje go do `/study/[folderId]`. Następnie pobierane jest `folderId` z URL i wykonywane jest żądanie do API w celu pobrania fiszek. Ze wszyskich pobranych fiszek z folderu wybierane jest losowe 20 fiszek do sesji.
- **Odwrócenie fiszki:** Kliknięcie przycisku "Odwróć" na komponencie `StudyFlashcard` pokazuje drugą stronę fiszki.
- **Ocena znajomości:**
  - Kliknięcie "Znam": Zwiększa licznik `knownFlashcards` i przechodzi do następnej fiszki.
  - Kliknięcie "Nie znam": Przechodzi do następnej fiszki bez zmiany licznika `knownFlashcards`.
- **Zakończenie sesji:** Po przejrzeniu wszystkich fiszek, widok przechodzi w stan `finished`, wyświetlając podsumowanie (np. "Gratulacje! Znasz X na Y fiszek.").

## 9. Warunki i walidacja
- **Warunek startu sesji:** Przycisk "Rozpocznij naukę" w widoku folderu (`FolderView.tsx`) powinien być aktywny tylko wtedy, gdy `flashcard_count >= 10`. Ta informacja jest dostępna w `FolderViewModel`.
- **Walidacja w widoku nauki:** Komponent `StudySessionView.tsx` powinien sprawdzić po załadowaniu danych, czy liczba pobranych fiszek jest wystarczająca. Jeśli nie, należy wyświetlić odpowiedni komunikat i przycisk powrotu.

## 10. Obsługa błędów
- **Błąd pobierania danych:** Jeśli żądanie do `/api/flashcards` zakończy się niepowodzeniem, stan `error` w `StudySessionViewModel` zostanie ustawiony, a na ekranie pojawi się komunikat błędu z przyciskiem umożliwiającym ponowienie próby lub powrót.
- **Brak fiszek:** Jeśli folder nie zawiera fiszek (lub jest ich mniej niż wymagane minimum, jeśli taka walidacja zostanie dodana po stronie widoku), użytkownik zobaczy komunikat informacyjny i zostanie zachęcony do powrotu.
- **Nieprawidłowy `folderId`:** Jeśli `folderId` w URL jest nieprawidłowy, API zwróci błąd 404, który zostanie obsłużony jak każdy inny błąd pobierania danych.

## 11. Kroki implementacji
1. **Utworzenie pliku strony Astro:** Stwórz plik `src/pages/study/[folderId].astro`, który będzie renderował główny komponent Reactowy.
2. **Utworzenie komponentu `StudySessionView.tsx`:** Zaimplementuj logikę pobierania danych z `/api/flashcards` przy użyciu `useEffect` i `fetch`. Zarządzaj stanem sesji (`StudySessionViewModel`) za pomocą `useState`.
3. **Utworzenie komponentu `StudyFlashcard.tsx`:** Stwórz komponent do wyświetlania pojedynczej fiszki z logiką odwracania karty.
4. **Utworzenie komponentu `StudyControls.tsx`:** Dodaj przyciski "Znam" i "Nie znam", przekazując akcje do komponentu nadrzędnego.
5. **Utworzenie komponentu `StudyProgress.tsx`:** Zaimplementuj pasek postępu i licznik, korzystając z `Progress` od `shadcn/ui`.
6. **Dodanie typów:** Zdefiniuj `StudySessionViewModel` w pliku `src/types.ts`.
7. **Modyfikacja `FolderView.tsx`:** Dodaj przycisk "Rozpocznij naukę", który będzie widoczny i aktywny tylko wtedy, gdy `folder.flashcard_count >= 10`. Przycisk powinien nawigować do `/study/[folderId]`.
8. **Modyfikacja `DashboardView.tsx`:** Dodaj przycisk "Rozpocznij naukę" na każdej karcie folderu (`FolderCard.tsx`), który będzie nawigował do odpowiedniej sesji nauki. Warunek `flashcard_count >= 10` musi być również tutaj zastosowany.
9. **Stylizowanie:** Użyj Tailwind CSS, aby ostylować wszystkie nowe komponenty zgodnie z minimalistycznym i skoncentrowanym na nauce designem.
10. **Obsługa błędów i stanów krańcowych:** Zaimplementuj wyświetlanie komunikatów o błędach, stanu ładowania oraz podsumowania po zakończeniu sesji.
