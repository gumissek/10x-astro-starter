# Architektura UI dla 10x-Cards-Flipper

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji **10x-Cards-Flipper** została zaprojektowana w oparciu o podejście "mobile-first", z wykorzystaniem frameworka Astro do renderowania statycznego oraz biblioteki React do tworzenia interaktywnych komponentów. Stylizacja opiera się na Tailwind CSS, a biblioteka komponentów `shadcn/ui` stanowi fundament dla spójnego i dostępnego systemu projektowego.

Główny układ aplikacji składa się ze stałego panelu bocznego (Sidebar) na urządzeniach desktopowych, który na urządzeniach mobilnych transformuje się w wysuwany panel (Sheet), zapewniając spójną nawigację. Zarządzanie stanem globalnym, takim jak dane zalogowanego użytkownika, będzie realizowane po stronie klienta za React hooks i react context. Komunikacja z API będzie asynchroniczna, a stany ładowania i błędy będą wyraźnie komunikowane użytkownikowi za pomocą komponentów `Spinner`, `Skeleton` i `Toast`.

## 2. Lista widoków

### Widok: Logowanie
- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie istniejącym użytkownikom zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail i hasło.
- **Kluczowe komponenty widoku:** `Card`, `Input`, `Button`, `Form`.
- **UX, dostępność i względy bezpieczeństwa:** Walidacja formularza w czasie rzeczywistym. Komunikaty o błędach (np. "Nieprawidłowe dane logowania"). Przekierowanie do dashboardu po pomyślnym zalogowaniu.

### Widok: Rejestracja
- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom utworzenia konta.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail i hasło (z potwierdzeniem).
- **Kluczowe komponenty widoku:** `Card`, `Input`, `Button`, `Form`.
- **UX, dostępność i względy bezpieczeństwa:** Walidacja hasła (min. 8 znaków) i formatu e-mail w czasie rzeczywistym. Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany do dashboardu.

### Widok: Dashboard (Panel główny)
- **Ścieżka:** `/dashboard`
- **Główny cel:** Wyświetlenie wszystkich folderów użytkownika i zapewnienie dostępu do głównych akcji.
- **Kluczowe informacje do wyświetlenia:** Siatka folderów, gdzie każdy folder wyświetla nazwę i liczbę fiszek.
- **Kluczowe komponenty widoku:** `Card` (dla folderów), `Button` ("Generuj fiszki", "Dodaj fiszkę"), `DropdownMenu` (akcje dla folderu: edytuj, usuń).
- **UX, dostępność i względy bezpieczeństwa:** Komponenty `Skeleton` podczas ładowania folderów. Potwierdzenie usunięcia folderu w modalu.

### Widok: Generowanie fiszek AI
- **Ścieżka:** `/generate`
- **Główny cel:** Umożliwienie użytkownikowi wklejenia tekstu i wygenerowania z niego fiszek za pomocą AI.
- **Kluczowe informacje do wyświetlenia:** Pole tekstowe, licznik znaków, lista wygenerowanych propozycji fiszek.
- **Kluczowe komponenty widoku:** `Textarea`, `Button` ("Generuj"), `Spinner` (podczas generowania), `Card` (dla każdej propozycji fiszki), `Combobox` (do wyboru folderu zapisu).
- **UX, dostępność i względy bezpieczeństwa:** Ograniczenie długości tekstu wejściowego. Jasne komunikaty o stanie ładowania. Możliwość edycji, akceptacji i odrzucenia każdej fiszki przed zapisem.

### Widok: Folder
- **Ścieżka:** `/folders/[folderId]`
- **Główny cel:** Wyświetlenie wszystkich fiszek w obrębie jednego folderu.
- **Kluczowe informacje do wyświetlenia:** Lista fiszek z treścią awersu i rewersu, ikoną pochodzenia (AI/manual).
- **Kluczowe komponenty widoku:** `Table` lub `Card` (dla listy fiszek), `Button` ("Ucz się z tego folderu"), `DropdownMenu` (akcje dla fiszki: edytuj, usuń).
- **UX, dostępność i względy bezpieczeństwa:** Paginacja dla dużej liczby fiszek. Potwierdzenie usunięcia fiszki w modalu.

### Widok: Sesja nauki
- **Ścieżka:** `/study`
- **Główny cel:** Przeprowadzenie interaktywnej sesji nauki z wybranego zestawu fiszek.
- **Kluczowe informacje do wyświetlenia:** "Odwracana" karta fiszki, licznik postępu.
- **Kluczowe komponenty widoku:** `Card` (interaktywna fiszka), `Button` (do oceny znajomości), `Progress`.
- **UX, dostępność i względy bezpieczeństwa:** Minimalistyczny interfejs skupiony na nauce. Obsługa za pomocą klawiatury.

### Widok: Ustawienia
- **Ścieżka:** `/settings`
- **Główny cel:** Zarządzanie kontem użytkownika.
- **Kluczowe informacje do wyświetlenia:** Informacje o koncie (np. e-mail).
- **Kluczowe komponenty widoku:** `Button` ("Wyloguj").
- **UX, dostępność i względy bezpieczeństwa:** Przycisk wylogowania wyraźnie oznaczony. Wylogowanie powinno przekierować na stronę logowania z komunikatem `Toast` o pomyślnym wylogowaniu.

## 3. Mapa podróży użytkownika

Główny przepływ użytkownika (generowanie fiszek AI):
1. **Rejestracja/Logowanie:** Użytkownik trafia na stronę `/login` lub `/register`, tworzy konto lub loguje się.
2. **Dashboard:** Po zalogowaniu jest przekierowywany na `/`, gdzie widzi swoje foldery (lub pusty stan).
3. **Inicjacja generowania:** Klika przycisk "Generuj fiszki przez AI", co przenosi go do widoku `/generate`.
4. **Generowanie:** Wkleja tekst do `Textarea` i klika "Generuj". Aplikacja wyświetla `Spinner` i komunikuje, że proces może potrwać.
5. **Przegląd fiszek:** Po otrzymaniu odpowiedzi z API, widok `/generate` wyświetla listę propozycji fiszek. Użytkownik przegląda je, akceptując, edytując (w modalu) lub odrzucając każdą z nich.
6. **Zapis:** Użytkownik wybiera folder docelowy (jeśli folder istnieje – pobierana jest lista folderów użytkownika z `/folders`) lub tworzy nowy, korzystając z `Combobox`, po czym klika "Zapisz X fiszek", co wysyła dane do endpointu `/api/flashcards/bulk-save`.
7. **Potwierdzenie:** Aplikacja wyświetla komunikat `Toast` o pomyślnym zapisaniu fiszek.
8. **Powrót do folderu:** Użytkownik może zostać przekierowany do widoku `/folders/[folderId]`, aby zobaczyć nowo dodane fiszki.

9. **Dodawanie manualne fiszek** Dodatkowo, użytkownik ma możliwość samodzielnego tworzenia nowych fiszek. W tym trybie użytkownik:
- Tworzy fiszki manualnie.
- Wybiera, do którego folderu chce je zapisać docelowy (jeśli folder istnieje – pobierana jest lista folderów użytkownika z `/folders`) lub tworzy nowy, korzystając z `Combobox` , korzystając z listy istniejących folderów.
- Alternatywnie, decyduje się na stworzenie nowego folderu, jeśli potrzebny folder jeszcze nie istnieje.

## 4. Układ i struktura nawigacji

Nawigacja opiera się na bocznym panelu (Sidebar/Sheet), który zawiera linki do kluczowych widoków:
- **Dashboard (`/`)**: Główny widok z folderami.
- **Generuj AI (`/generate`)**: Strona do generowania fiszek.
- **Ustawienia (`/settings`)**: Strona ustawień konta.

Przycisk "Dodaj fiszkę manualnie" na dashboardzie otwiera modal z formularzem, bez zmiany widoku. Wejście do konkretnego folderu (`/folders/[folderId]`) lub sesji nauki (`/study`) odbywa się poprzez interakcje w widoku dashboardu lub folderu.

## 5. Kluczowe komponenty

Poniższe komponenty `shadcn/ui` będą używane w całej aplikacji w celu zapewnienia spójności:
- **`Card`**: Podstawowy kontener dla elementów takich jak foldery, fiszki i formularze.
- **`Button`**: Do wszystkich akcji wykonywanych przez użytkownika.
- **`Input` & `Textarea`**: Do wprowadzania danych w formularzach.
- **`Form`**: Do zarządzania stanem formularzy i walidacją.
- **`Modal/Dialog`**: Do akcji wymagających dodatkowego kontekstu lub potwierdzenia (np. edycja, usuwanie).
- **`Toast`**: Do wyświetlania krótkich, asynchronicznych powiadomień o sukcesie lub błędzie.
- **`Spinner` & `Skeleton`**: Do wizualizacji stanów ładowania danych.
- **`DropdownMenu`**: Do ukrywania dodatkowych akcji (np. edytuj/usuń) w celu zachowania czystości interfejsu.
- **`Combobox`**: Do wyboru folderu podczas zapisywania fiszek, z opcją dynamicznego tworzenia nowego.
