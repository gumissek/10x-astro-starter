# Dokument wymagań produktu (PRD) - Fiszki Edukacyjne **10x-Cards-Flipper**

## 1. Przegląd produktu

Projekt "Fiszki Edukacyjne" to aplikacja webowa umożliwiająca tworzenie oraz naukę fiszek, skierowana głównie do osób uczących się języka angielskiego (polski → angielski). Aplikacja integruje mechanizmy generowania treści przy użyciu GPT-4o-mini API z tradycyjnym, manualnym procesem tworzenia fiszek. Użytkownicy mogą rejestrować się, logować na swoje konto, organizować fiszki w foldery oraz uczestniczyć w sesjach nauki opartej na mechanice spaced repetition (w uproszczonej wersji).

Technologie:

- Frontend - Astro z React dla komponentów interaktywnych:
  - Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
  - React 19 zapewni interaktywność tam, gdzie jest potrzebna
  - TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
  - Tailwind 4 pozwala na wygodne stylowanie aplikacji
  - Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI
- Backend - Supabase jako kompleksowe rozwiązanie backendowe:
  - Zapewnia bazę danych PostgreSQL
  - Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
  - Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
  - Posiada wbudowaną autentykację użytkowników
- AI - Komunikacja z modelami przez usługę Openrouter.ai:
  - Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
  - Pozwala na ustawianie limitów finansowych na klucze API
- CI/CD i Hosting:
  - Github Actions do tworzenia pipeline’ów CI/CD
  - Cloudflare Pages do hostowania aplikacji 

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek jest czasochłonne i pracochłonne. Użytkownicy często rezygnują z wykorzystywania metody spaced repetition, ponieważ proces przygotowywania materiału nie jest efektywny. Problem polega na konieczności automatyzacji generowania fiszek, przy jednoczesnym pozostawieniu kontroli nad jakością końcowego produktu w rękach użytkownika.

## 3. Wymagania funkcjonalne

- Generowanie fiszek przez AI:
  - Użytkownik wkleja tekst (maks. 5000 znaków) do pola tekstowego z licznikiem znaków.
  - Po kliknięciu przycisku "Generate" wyświetlany jest loading spinner oraz komunikat informujący, że generowanie może trwać dłuższą chwilę.
  - System wysyła request do GPT-4o-mini API z chain-of-thought promptingiem i oczekuje odpowiedzi w formacie JSON zawierającej tablicę fiszek (maks. 30) oraz sugerowaną nazwę folderu.
  - Ograniczenia: przód fiszki max 200 znaków, tył fiszki max 500 znaków.

- Proces akceptacji wygenerowanych fiszek:
  - Wyświetlana jest lista wygenerowanych fiszek z opcjami: Accept, Edit, Reject.
  - Użytkownik może zaakceptować fiszkę bez zmian lub dokonać edycji (inline modal z formularzem) przed akceptacją.
  - Po zakończeniu przeglądu, użytkownik klika przycisk "Save X flashcards to folder", gdzie X oznacza liczbę zaakceptowanych fiszek.

- Manualne tworzenie fiszki:
  - Formularz umożliwia wprowadzenie treści fiszki ręcznie (Front: max 200 znaków, Back: max 500 znaków) oraz wybór folderu (istniejącego lub nowego).
  - Walidacja w czasie rzeczywistym: liczniki znaków oraz sprawdzenie obowiązkowych pól.

- CRUD operacje na fiszkach i folderach:
  - Użytkownik może przeglądać, edytować i usuwać fiszki oraz foldery.
  - Edycja fiszek odbywa się w modalach z formularzami.
  - Usunięcie folderu powoduje kaskadowe usunięcie wszystkich fiszek w nim zawartych.

- Uwierzytelnienie i autoryzacja:
  - Rejestracja: email i hasło (min. 8 znaków) z inline walidacją (regex dla email).
  - Logowanie: przy użyciu email i hasła, co skutkuje uzyskaniem JWT tokena ważnego 24 godziny.
  - Wszystkie endpointy (z wyjątkiem /register i /login) chronione są przez JWT.

## 4. Granice produktu

Co NIE wchodzi w zakres MVP:

- Zaawansowany algorytm spaced repetition (np. SM-2, SuperMemo)
- Import fiszek z różnych formatów (PDF, DOCX, itp.) – dostępny tylko copy-paste tekstu
- Współdzielenie fiszek między użytkownikami
- Aplikacje mobilne (tylko wersja web)
- Dark mode
- Zaawansowane testowanie automatyczne
- Eksport fiszek do innych platform (Anki, Quizlet, itp.)

## 5. Historyjki użytkowników

### US-001: Generowanie fiszek przez AI

- ID: US-001
- Tytuł: Generowanie fiszek przez AI
- Opis: Jako zalogowany użytkownik uczący się angielskiego, chcę wkleić tekst do pola (maks. 5000 znaków) i automatycznie otrzymać zestaw fiszek wygenerowanych przez AI, aby zaoszczędzić czas przy ręcznym tworzeniu fiszek.
- Kryteria akceptacji:
  - Użytkownik wkleja tekst do pola tekstowego.
  - Po kliknięciu "Generate" pojawia się loading spinner.
  - System wyświetla listę do 30 fiszek wraz z sugerowaną nazwą folderu.
  - Fiszki spełniają ograniczenia: przód (max 200 znaków), tył (max 500 znaków).

### US-002: Akceptacja wygenerowanych fiszek AI

- ID: US-002
- Tytuł: Akceptacja wygenerowanych fiszek przez AI
- Opis: Jako zalogowany użytkownik, chcę mieć możliwość przeglądu wygenerowanych przez AI fiszek i ich akceptacji, edycji lub odrzucenia, aby kontrolować jakość materiałów do nauki.
- Kryteria akceptacji:
  - Lista wygenerowanych fiszek zawiera przyciski: Accept, Edit, Reject.
  - Użytkownik widzi licznik zaakceptowanych fiszek.
  - Zatwierdzone fiszki mogą być zapisane do wybranego folderu.

### US-003: Manualne tworzenie fiszki

- ID: US-003
- Tytuł: Manualne tworzenie fiszki
- Opis: Jako zalogowany użytkownik, chcę móc ręcznie tworzyć fiszki poprzez formularz, aby dodać te informacje, których AI mogło nie wygenerować.
- Kryteria akceptacji:
  - Formularz zawiera pola: Front (max 200 znaków), Back (max 500 znaków) oraz wybór folderu.
  - Pola są walidowane w czasie rzeczywistym (liczniki znaków, wymagane pola).
  - Przycisk "Save" staje się aktywny po poprawnej walidacji i zapisuje fiszkę do wybranego folderu.

### US-004: Edycja zapisanej fiszki

- ID: US-004
- Tytuł: Edycja fiszki
- Opis: Jako zalogowany użytkownik, chcę móc edytować zapisane fiszki, aby poprawić błędy lub uaktualnić treść.
- Kryteria akceptacji:
  - Każda fiszka ma opcję edycji dostępną w widoku listy.
  - Edycja odbywa się w modalnym oknie z formularzem.
  - Po zapisaniu zmian, fiszka zostaje zaktualizowana.

### US-006: Organizacja fiszek w foldery

- ID: US-006
- Tytuł: Organizacja fiszek w foldery
- Opis: Jako zalogowany użytkownik, chcę móc organizować moje fiszki w foldery, aby łatwiej zarządzać materiałem i odnajdywać tematyczne fiszki.
- Kryteria akceptacji:
  - Użytkownik może tworzyć foldery podczas zapisywania fiszek lub bezpośrednio z dashboardu.
  - Na dashboardzie widoczna jest lista folderów z nazwami i liczbą fiszek w każdym folderze.
  - Użytkownik ma możliwość zmiany nazwy folderu lub jego usunięcia (usunięcie folderu powoduje kaskadowe usunięcie fiszek).

### US-007: Rejestracja i logowanie

- ID: US-007
- Tytuł: Rejestracja i logowanie użytkownika
- Opis: Jako nowy użytkownik, chcę zarejestrować się i zalogować przy użyciu emaila oraz hasła, aby móc zapisywać i zarządzać swoimi fiszkami w chmurze.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola: email (walidacja regex) i hasło (min. 8 znaków).
  - Po udanej rejestracji użytkownik zostaje automatycznie zalogowany i otrzymuje JWT token ważny 24 godziny.
  - Endpointy inne niż /register i /login wymagają autoryzacji JWT.

  ### US-008: Odzyskiwanie hasła

  - ID: US-008  
  - Tytuł: Odzyskiwanie hasła  
  - Opis: Jako użytkownik, który zapomniał swojego hasła, chcę mieć możliwość odzyskania dostępu do konta poprzez procedurę resetowania hasła, aby móc ponownie korzystać z aplikacji.  
  - Kryteria akceptacji:
    - Użytkownik wybiera opcję "Nie pamiętam hasła" na stronie logowania.
    - System prosi o podanie adresu email powiązanego z kontem.
    - Po wprowadzeniu emaila, użytkownik otrzymuje wiadomość z linkiem do resetowania hasła.
    - Link umożliwia ustawienie nowego hasła, które spełnia wymogi bezpieczeństwa (min. 8 znaków).
    - Po poprawnej zmianie hasła, użytkownik może zalogować się przy użyciu nowego hasła.

### US-009: Sesja nauki z fiszkami
- ID: US-008
- Tytuł: Sesja nauki z fiszkami
- Opis: Jako zalogowany użytkownik, chcę móc przeprowadzić interaktywną sesje nauki z poziomu (`/dashboard` - z tego poziomu wybiera folder z którego ma rozpocząc naukę) lub z poziomu wybranego folderu (jeśli folder zawiera co najmniej 10 fiszek), aby efektywnie utrwalać wiedzę.
- Kryteria akceptacji:
  - Użytkownik wybiera folder lub z poziomu (`/dashboard`) rozpoczyna sesję nauki.
  - Fiszki są wyświetlane pojedynczo z możliwością "odwrócenia" karty.
  - Użytkownik ocenia swoją znajomość fiszki (np. "Znam", "Nie znam").
  - Postęp sesji jest wizualizowany (np. licznik ukończonych fiszek).

## 6. Metryki sukcesu

- Akceptacja AI: Co najmniej 75% fiszek wygenerowanych przez AI musi być zaakceptowanych przez użytkowników (wliczając fiszki edytowane).
- Wykorzystanie AI: Użytkownicy powinni generować minimum 75% swoich fiszek poprzez funkcję AI.
- Zaangażowanie: Monitorowanie liczby aktywnych użytkowników, sesji nauki oraz średniej liczby fiszek na użytkownika.
- Efektywność sesji: Średni czas trwania sesji nauki oraz wskaźnik ukończenia sesji (20 fiszek).
- Feedback użytkowników: Regularne zbieranie opinii i ocen jakości interfejsu oraz funkcjonalności aplikacji.
