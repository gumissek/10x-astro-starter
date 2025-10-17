### **Plan Testów Aplikacji "10x Cards Flipper"**

---

#### **1. Wprowadzenie i Cele Testowania**

**Wprowadzenie**
Niniejszy dokument opisuje plan testów dla aplikacji webowej "10x Cards Flipper" – narzędzia do tworzenia i nauki fiszek. Aplikacja umożliwia użytkownikom zarządzanie folderami, tworzenie fiszek ręcznie oraz z wykorzystaniem AI, a także przeprowadzanie sesji nauki. Plan ten obejmuje strategię, zakres, zasoby i harmonogram działań związanych z zapewnieniem jakości.

**Główne cele testowania:**
*   **Weryfikacja funkcjonalności:** Zapewnienie, że wszystkie kluczowe funkcje aplikacji działają zgodnie ze specyfikacją, w tym autentykacja, zarządzanie folderami i fiszkami (CRUD), generowanie fiszek przez AI oraz moduł nauki.
*   **Zapewnienie stabilności i wydajności:** Identyfikacja i eliminacja "wąskich gardeł" wydajnościowych, zwłaszcza w interakcji z bazą danych Supabase i API zewnętrznym (AI).
*   **Sprawdzenie bezpieczeństwa:** Weryfikacja podstawowych mechanizmów bezpieczeństwa, w tym autoryzacji dostępu do zasobów (folderów, fiszek) i ochrony danych użytkownika.
*   **Ocena użyteczności (UX/UI):** Zapewnienie, że interfejs użytkownika jest intuicyjny, responsywny na różnych urządzeniach i spójny wizualnie zgodnie z frameworkiem Tailwind CSS.
*   **Wykrycie i zaraportowanie błędów:** Systematyczne identyfikowanie, dokumentowanie i śledzenie defektów w celu ich naprawy przed wdrożeniem produkcyjnym.

---

#### **2. Zakres Testów**

**Funkcjonalności objęte testami:**
*   **Moduł Uwierzytelniania Użytkownika:**
    *   Rejestracja nowego użytkownika.
    *   Logowanie i wylogowywanie.
    *   Proces resetowania hasła.
    *   Walidacja formularzy (email, hasło) po stronie klienta i serwera.
*   **Zarządzanie Folderami (CRUD):**
    *   Tworzenie, odczyt, aktualizacja i usuwanie folderów.
    *   Wyświetlanie listy folderów z paginacją.
    *   Wyświetlanie liczby fiszek w folderze.
*   **Zarządzanie Fiszkami (CRUD):**
    *   Ręczne tworzenie, odczyt, edycja i usuwanie fiszek w obrębie folderu.
    *   Walidacja danych wejściowych (długość tekstu, wymagane pola).
*   **Generowanie Fiszek przez AI:**
    *   Generowanie propozycji fiszek na podstawie wklejonego tekstu.
    *   Interfejs do akceptacji, odrzucania i edycji wygenerowanych propozycji.
    *   Zbiorcze zapisywanie zaakceptowanych fiszek do wybranego lub nowego folderu.
*   **Moduł Nauki:**
    *   Rozpoczynanie sesji nauki dla folderów zawierających wymaganą liczbę fiszek.
    *   Interfejs odwracania fiszki (przód/tył).
    *   Obsługa postępów w sesji (oznaczanie jako "znam" / "nie znam").
    *   Wyświetlanie paska postępu i ekranu ukończenia sesji.
*   **API Backendowe:**
    *   Wszystkie punkty końcowe `/api/` (autoryzacja, foldery, fiszki).
    *   Obsługa błędów, walidacja zapytań i poprawność odpowiedzi HTTP.

**Funkcjonalności wyłączone z testów:**
*   Testy samego API Supabase oraz zewnętrznego serwisu AI (OpenRouter) – zakładamy ich stabilność, testujemy jedynie integrację z nimi.
*   Szczegółowe testy wydajnościowe pod ekstremalnym obciążeniem (stress tests) – na tym etapie skupiamy się na testach obciążeniowych (load tests) w typowych scenariuszach użycia.

---

#### **3. Typy Testów do Przeprowadzenia**

| Typ Testu | Opis i Uzasadnienie | Narzędzia |
| :--- | :--- | :--- |
| **Testy Jednostkowe** | Weryfikacja poszczególnych komponentów React, funkcji pomocniczych (`/lib/utils.ts`) i logiki biznesowej w serwisach (`/lib/services`). Celem jest wczesne wykrywanie błędów na najniższym poziomie. | Vitest, React Testing Library |
| **Testy Integracyjne** | Sprawdzenie współpracy między komponentami UI a warstwą usług (serwisy `FolderService`, `FlashcardGenerationService`) oraz poprawności komunikacji z API backendowym. | Vitest, React Testing Library z mockowaniem API (np. MSW) |
| **Testy End-to-End (E2E)** | Symulacja pełnych przepływów użytkownika w przeglądarce, np. od rejestracji, przez stworzenie folderu i fiszek, po sesję nauki. Weryfikują całą aplikację jako spójną całość. | Playwright lub Cypress |
| **Testy API** | Bezpośrednie testowanie punktów końcowych API w celu weryfikacji logiki backendowej, autoryzacji, walidacji danych wejściowych i formatu odpowiedzi, niezależnie od interfejsu użytkownika. | Postman, lub testy E2E w Playwright/Cypress |
| **Testy UI/UX** | Ręczna weryfikacja interfejsu pod kątem spójności wizualnej, responsywności (mobile, tablet, desktop) i ogólnej intuicyjności obsługi. | Ręczne testy, narzędzia deweloperskie w przeglądarkach |
| **Testy Bezpieczeństwa** | Weryfikacja, czy użytkownik ma dostęp wyłącznie do swoich zasobów (folderów i fiszek). Sprawdzenie, czy API odrzuca nieautoryzowane żądania. Podstawowe testy penetracyjne dla znanych podatności (np. XSS w polach formularzy). | Ręczne testy, ZAP (OWASP) |

---

#### **4. Kluczowe Scenariusze Testowe**

Poniżej przedstawiono najważniejsze scenariusze (happy paths i edge cases) do przetestowania:

*   **SCN-01: Pełen cykl życia użytkownika**
    1. Użytkownik pomyślnie rejestruje nowe konto.
    2. Użytkownik loguje się na nowo utworzone konto.
    3. Użytkownik wylogowuje się.
    4. Użytkownik korzysta z funkcji "Zapomniałem hasła" i pomyślnie je resetuje.
*   **SCN-02: Zarządzanie folderami**
    1. Użytkownik tworzy nowy folder z unikalną nazwą.
    2. Próba utworzenia folderu o tej samej nazwie kończy się błędem.
    3. Użytkownik edytuje nazwę istniejącego folderu.
    4. Użytkownik usuwa folder, co powoduje kaskadowe usunięcie wszystkich zawartych w nim fiszek.
*   **SCN-03: Proces generowania fiszek przez AI**
    1. Użytkownik wkleja tekst (np. 500 słów) i uruchamia generowanie.
    2. System wyświetla propozycje fiszek oraz sugerowaną nazwę folderu.
    3. Użytkownik akceptuje część fiszek, odrzuca inne, a jedną edytuje.
    4. Użytkownik zapisuje zaakceptowane fiszki do nowego folderu.
*   **SCN-04: Sesja nauki**
    1. Użytkownik wchodzi do folderu z co najmniej 10 fiszkami i rozpoczyna sesję nauki.
    2. Użytkownik przechodzi przez kilka fiszek, odwracając je i oznaczając jako "Znam" / "Nie znam".
    3. Postęp jest poprawnie wyświetlany.
    4. Po przejściu wszystkich fiszek wyświetla się ekran podsumowania.
*   **SCN-05: Autoryzacja i dostęp do danych**
    1. Użytkownik A loguje się i tworzy folder.
    2. Użytkownik B loguje się na innym koncie.
    3. Użytkownik B próbuje uzyskać dostęp do folderu użytkownika A poprzez bezpośrednie odwołanie do URL.
    4. System blokuje dostęp i wyświetla odpowiedni komunikat.

---

#### **5. Środowisko Testowe**

*   **Środowisko lokalne (deweloperskie):** Uruchomienie aplikacji na maszynie dewelopera. Baza danych Supabase w wersji deweloperskiej.
*   **Środowisko testowe (Staging):** Oddzielna instancja aplikacji wdrożona na platformie hostingowej (np. Vercel, Netlify), połączona z osobnym projektem Supabase pełniącym rolę bazy testowej. To środowisko będzie używane do testów E2E i UAT (User Acceptance Testing).
*   **Przeglądarki:** Testy będą przeprowadzane na najnowszych wersjach Chrome, Firefox oraz Safari.
*   **Urządzenia:** Testy responsywności będą wykonywane przy użyciu narzędzi deweloperskich w przeglądarkach oraz na fizycznych urządzeniach mobilnych (iOS, Android).

---

#### **6. Narzędzia do Testowania**

| Kategoria | Narzędzie | Zastosowanie |
| :--- | :--- | :--- |
| **Framework do testów JS** | `Vitest` | Uruchamianie testów jednostkowych i integracyjnych. |
| **Biblioteka testująca** | `React Testing Library` | Renderowanie i interakcja z komponentami React w testach. |
| **Testy E2E** | `Playwright` | Automatyzacja scenariuszy testowych w przeglądarce. |
| **Zarządzanie Zadaniami i Błędami** | `Jira / GitHub Issues` | Tworzenie, śledzenie i zarządzanie zadaniami oraz raportami o błędach. |
| **Kontrola Wersji** | `Git / GitHub` | Zarządzanie kodem źródłowym i procesem code review. |
| **CI/CD** | `GitHub Actions` | Automatyczne uruchamianie testów (jednostkowych, E2E) po każdym commicie/pull request. |

---

#### **7. Harmonogram Testów (Przykładowy)**

| Faza | Czas trwania | Główne działania |
| :--- | :--- | :--- |
| **Sprint 1** | Tydzień 1-2 | Pisanie testów jednostkowych i integracyjnych dla logiki biznesowej i kluczowych komponentów. Konfiguracja CI/CD. |
| **Sprint 2** | Tydzień 3-4 | Rozwój testów E2E dla głównych przepływów (rejestracja, CRUD folderów/fiszek). Pierwsze testy manualne. |
| **Sprint 3** | Tydzień 5-6 | Rozszerzenie testów E2E o moduł AI i sesji nauki. Testy bezpieczeństwa i wydajności. |
| **Faza Stabilizacji** | Tydzień 7 | Regresja, testy UAT, finalizowanie raportowania błędów. |

---

#### **8. Kryteria Akceptacji**

*   **Kryteria rozpoczęcia testów:** Stabilna wersja aplikacji wdrożona na środowisku Staging. Główne funkcjonalności są zaimplementowane.
*   **Kryteria zakończenia testów (Definition of Done):**
    *   Pokrycie kodu testami jednostkowymi na poziomie min. 80%.
    *   Wszystkie zdefiniowane scenariusze E2E przechodzą pomyślnie.
    *   Brak błędów krytycznych i blokujących.
    *   Wszystkie błędy o wysokim priorytecie zostały naprawione.
    *   Aplikacja działa poprawnie na wszystkich wspieranych przeglądarkach.

---

#### **9. Role i Odpowiedzialności**

*   **Inżynier QA:** Odpowiedzialny za tworzenie i realizację planu testów, automatyzację testów, raportowanie błędów i weryfikację poprawek.
*   **Deweloperzy:** Odpowiedzialni za pisanie testów jednostkowych, naprawianie zgłoszonych błędów i wsparcie w analizie problemów.
*   **Product Owner / Manager:** Odpowiedzialny za zdefiniowanie priorytetów, kryteriów akceptacji oraz przeprowadzenie testów UAT.

---

#### **10. Procedury Raportowania Błędów**

Każdy zgłoszony błąd w systemie (np. GitHub Issues) musi zawierać:
1.  **Tytuł:** Krótki, zwięzły opis problemu.
2.  **Środowisko:** Gdzie wystąpił błąd (np. Staging, Chrome v123).
3.  **Kroki do odtworzenia:** Szczegółowa, numerowana lista czynności prowadzących do wystąpienia błędu.
4.  **Oczekiwany rezultat:** Co powinno się wydarzyć.
5.  **Rzeczywisty rezultat:** Co się faktycznie wydarzyło.
6.  **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.
7.  **Priorytet:** Krytyczny, Wysoki, Średni, Niski.
