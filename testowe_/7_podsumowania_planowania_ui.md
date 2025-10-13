a. Główne wymagania dotyczące architektury UI Aplikacja zostanie zbudowana w oparciu o Astro z interaktywnymi komponentami React. Stylizacja zostanie zrealizowana za pomocą Tailwind CSS, a biblioteka shadcn/ui posłuży jako fundament dla komponentów UI. Architektura będzie oparta na stałym bocznym panelu nawigacyjnym (Sidebar) na urządzeniach desktopowych, który na urządzeniach mobilnych będzie zastępowany wysuwanym panelem (Sheet). Projekt będzie realizowany zgodnie z podejściem "mobile-first".

b. Kluczowe widoki, ekrany i przepływy użytkownika

- Uwierzytelnianie: Osobne strony /login i /register z walidacją formularzy w czasie rzeczywistym. Po pomyślnym zalogowaniu/rejestracji użytkownik jest przekierowywany na główny dashboard.
Dashboard (/): Główny widok po zalogowaniu. Wyświetla foldery użytkownika jako siatkę "klocków" (Card), każdy z nazwą, liczbą fiszek i akcjami edycji/usunięcia. Zawiera główne przyciski akcji: "Generuj fiszki przez AI" i "Dodaj fiszkę manualnie" oraz "Rozpocznij sesję nauki".
- Generowanie AI (/generate): Widok z polem tekstowym do wklejenia treści. Po wygenerowaniu wyświetla listę proponowanych fiszek z opcjami "Accept", "Edit", "Reject". Umożliwia zapisanie zaakceptowanych fiszek do nowego lub istniejącego folderu za pomocą Combobox.
- Widok folderu (/folders/{id}): Wyświetla listę wszystkich fiszek w danym folderze. Każda fiszka pokazuje treść front i back, ikonę pochodzenia (AI/manual) oraz opcje edycji/usunięcia. Zawiera przycisk "Ucz się z tego folderu".
- Sesja nauki (/study): Dedykowany widok z interfejsem "odwracanej karty". Umożliwia naukę fiszek z wybranego folderu lub losowo. Zawiera licznik postępu i przyciski do oceny znajomości odpowiedzi.
Ustawienia (/settings): Prosta strona z informacjami o koncie i przyciskiem wylogowania.
c. Strategia integracji z API i zarządzania stanem

- Zarządzanie stanem: Globalny stan aplikacji (np. dane zalogowanego użytkownika, lista folderów) będzie zarządzany po stronie klienta React hooks i react context.
- Integracja z API: Komunikacja z API będzie odbywać się asynchronicznie. Stany ładowania będą wizualizowane za pomocą komponentów Skeleton i Spinner. Błędy zwracane przez API (np. walidacyjne, serwera) oraz komunikaty o sukcesie będą wyświetlane za pomocą komponentu Toast.
- Tworzenie folderu: Próba utworzenia folderu o istniejącej nazwie zostanie obsłużona przez przechwycenie błędu 400 z API i wyświetlenie odpowiedniego komunikatu w formularzu.
- Zapisywanie fiszek: Fiszki zaakceptowane po generacji AI będą zapisywane za pomocą endpointu POST /flashcards/bulk-save.
d. Kwestie dotyczące responsywności, dostępności i bezpieczeństwa

- Responsywność: Wszystkie widoki, w tym dashboard, listy i formularze, będą w pełni responsywne, adaptując układ z wielokolumnowego na jednokolumnowy na mniejszych ekranach.
- Dostępność: Użycie semantycznego HTML i komponentów z shadcn/ui (które są zbudowane z myślą o dostępności) pomoże w zapewnieniu podstawowego poziomu dostępności.
- Bezpieczeństwo: Aplikacja będzie obsługiwać błędy autoryzacji (401 Unauthorized) poprzez automatyczne wylogowanie użytkownika i przekierowanie go do strony logowania, informując o wygaśnięciu sesji. Wszystkie żądania do chronionych endpointów API będą zawierały token JWT.</ui_architecture_planning_summary> <unresolved_issues> Brak nierozwiązanych kwestii. Plan architektury UI dla MVP jest spójny i gotowy do dalszych etapów implementacji. </unresolved_issues> </conversation_summary>