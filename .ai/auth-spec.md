# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Przegląd

Niniejszy dokument opisuje architekturę i implementację modułu uwierzytelniania i autoryzacji dla aplikacji **10x-Cards-Flipper**. Rozwiązanie bazuje na wymaganiach zdefiniowanych w PRD (US-007, US-008) oraz na wybranym stosie technologicznym, z kluczowym wykorzystaniem **Supabase Auth** jako dostawcy usług autentykacji oraz **Astro** w trybie renderowania po stronie serwera (`output: "server"`).

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Strony i Layouty

Wprowadzone zostaną nowe layouty i strony w celu rozdzielenia widoków dla użytkowników zalogowanych i niezalogowanych.

-   **`src/layouts/AuthLayout.astro`**: Layout dla stron dostępnych dla zalogowanych użytkowników (np. dashboard, foldery). Będzie zawierał główną nawigację aplikacji z opcją "Wyloguj".
-   **`src/layouts/GuestLayout.astro`**: Layout dla stron publicznych (logowanie, rejestracja, odzyskiwanie hasła). Będzie zawierał uproszczoną nawigację z linkami do logowania/rejestracji.
-   **`src/pages/login.astro`**: Strona logowania, wykorzystująca `GuestLayout`. Będzie renderować komponent React `LoginForm`.
-   **`src/pages/register.astro`**: Strona rejestracji, wykorzystująca `GuestLayout`. Będzie renderować komponent React `RegisterForm`.
-   **`src/pages/password-reset.astro`**: Strona do wpisania nowego hasła po kliknięciu w link z maila.
-   **`src/pages/forgot-password.astro`**: Strona z formularzem do zainicjowania procesu odzyskiwania hasła.

### 2.2. Komponenty React (Client-Side)

Interaktywne formularze zostaną zaimplementowane jako komponenty React (`.tsx`) z wykorzystaniem biblioteki `shadcn/ui` oraz `zod` do walidacji.

-   **`src/components/auth/LoginForm.tsx`**:
    -   **Odpowiedzialność**: Obsługa formularza logowania (pola: email, hasło).
    -   **Walidacja**:
        -   Email: Sprawdzenie formatu (regex).
        -   Hasło: Sprawdzenie, czy nie jest puste.
        -   Komunikaty o błędach wyświetlane pod odpowiednimi polami.
    -   **Logika**: Po submisji, komponent wywołuje funkcję `supabase.auth.signInWithPassword()`. W przypadku sukcesu, nawiguje użytkownika do `/dashboard`. W przypadku błędu, wyświetla globalny komunikat (np. "Nieprawidłowy email lub hasło").
-   **`src/components/auth/RegisterForm.tsx`**:
    -   **Odpowiedzialność**: Obsługa formularza rejestracji (pola: email, hasło, powtórz hasło).
    -   **Walidacja**:
        -   Email: Sprawdzenie formatu (regex).
        -   Hasło: Minimum 8 znaków, jeden wielki znak, jedna cyfra i jeden znak specjalny.
        -   Powtórz hasło: Musi być identyczne z hasłem.
        -   Walidacja w czasie rzeczywistym (on-blur).
    -   **Logika**: Po submisji, komponent wywołuje `supabase.auth.signUp()`. Po udanej rejestracji, Supabase automatycznie loguje użytkownika i następuje przekierowanie do `/dashboard`.
-   **`src/components/auth/ForgotPasswordForm.tsx`**:
    -   **Odpowiedzialność**: Formularz z jednym polem (email) do wysłania linku resetującego hasło.
    -   **Logika**: Wywołuje `supabase.auth.resetPasswordForEmail()`. Po wysłaniu wyświetla komunikat o powodzeniu (np. "Jeśli konto istnieje, link do resetu hasła został wysłany.").
-   **`src/components/auth/ResetPasswordForm.tsx`**:
    -   **Odpowiedzialność**: Formularz z polami na nowe hasło i jego powtórzenie.
    -   **Logika**: Wywołuje `supabase.auth.updateUser()` z nowym hasłem. Po pomyślnej zmianie, przekierowuje na stronę logowania z komunikatem o sukcesie.

### 2.3. Scenariusze Użytkownika

-   **Logowanie**: Użytkownik wchodzi na `/login`, wypełnia formularz, klika "Zaloguj". Po sukcesie jest na `/dashboard`. Po błędzie widzi komunikat.
-   **Rejestracja**: Użytkownik wchodzi na `/register`, wypełnia formularz. Po sukcesie jest automatycznie zalogowany i przekierowany na `/dashboard`.
-   **Odzyskiwanie hasła**: Użytkownik na `/login` klika "Zapomniałem hasła", przechodzi do `/forgot-password`, wpisuje email. Otrzymuje maila, klika link, przechodzi do `/password-reset`, ustawia nowe hasło i jest przekierowywany do `/login`.
-   **Dostęp do chronionej strony**: Niezalogowany użytkownik próbujący wejść na `/dashboard` jest przekierowywany na `/login`.

## 3. Logika Backendowa (Astro Server-Side)

Dzięki konfiguracji `output: "server"`, każda strona `.astro` może wykonywać logikę po stronie serwera przed wyrenderowaniem HTML.

### 3.1. Middleware Autoryzacji

Zostanie utworzony plik `src/middleware.ts`, który będzie przechwytywał wszystkie żądania do aplikacji.

-   **Odpowiedzialność**: Sprawdzanie sesji użytkownika dla każdego żądania.
-   **Logika**:
    1.  Na podstawie ciasteczka sesji (`sb-access-token`, `sb-refresh-token`) odtwarza sesję użytkownika przy użyciu `supabase.auth.getUser()`.
    2.  Jeśli użytkownik jest zalogowany, jego dane są umieszczane w `context.locals.user` do dalszego wykorzystania na stronach.
    3.  Jeśli użytkownik **nie jest** zalogowany i próbuje uzyskać dostęp do chronionej ścieżki (np. `/dashboard`, `/folders/*`), middleware zwróci `context.redirect('/login')`.
    4.  Jeśli użytkownik **jest** zalogowany i próbuje wejść na `/login` lub `/register`, middleware przekieruje go do `/dashboard`.

### 3.2. Endpointy API (Astro API Routes)

Supabase Auth eliminuje potrzebę tworzenia własnych endpointów dla logowania, rejestracji i resetu hasła. Należy jednak stworzyć endpoint do obsługi wylogowania.

-   **`src/pages/api/auth/logout.ts`**:
    -   **Metoda**: `POST`
    -   **Logika**: Wywołuje serwerową funkcję `supabase.auth.signOut()`. Czyści ciasteczka sesji i zwraca odpowiedź o sukcesie, po której frontend przekierowuje na stronę główną lub logowania.

### 3.3. Renderowanie Stron (Server-Side)

Strony takie jak `/dashboard` będą wykorzystywać dane użytkownika przekazane przez middleware z `Astro.locals.user` do personalizacji widoku (np. wyświetlenie nazwy użytkownika, pobranie jego folderów).

```astro
// Przykład użycia w src/pages/dashboard.astro
---
import AuthLayout from '../layouts/AuthLayout.astro';

const { user } = Astro.locals; // user wstrzyknięty przez middleware
// Logika pobierania danych specyficznych dla 'user.id'
---
<AuthLayout title="Dashboard">
  <h1>Witaj, {user.email}!</h1>
  <!-- Komponenty do wyświetlania folderów -->
</AuthLayout>
```

## 4. System Autentykacji (Supabase)

### 4.1. Konfiguracja

-   W panelu Supabase zostanie włączony **Supabase Auth**.
-   Zostaną skonfigurowane szablony e-mail dla potwierdzenia rejestracji (opcjonalnie, domyślnie wyłączone) oraz dla resetowania hasła.
-   Zostaną utworzone dwa klienty Supabase w kodzie aplikacji:
    -   **Klient client-side**: Inicjalizowany w globalnym skrypcie lub w layoutach, dostępny dla komponentów React. Używa `createBrowserClient`.
    -   **Klient server-side**: Inicjalizowany w middleware i na stronach/endpointach Astro. Używa `createServerClient` i przekazuje mu `cookies` z obiektu żądania/odpowiedzi.

### 4.2. Przepływ JWT i Sesji

-   Supabase Auth operuje na tokenach JWT (Access Token i Refresh Token).
-   Po zalogowaniu/rejestracji, SDK Supabase automatycznie zapisuje te tokeny w bezpiecznych ciasteczkach (`HttpOnly`).
-   Middleware na serwerze odczytuje te ciasteczka przy każdym żądaniu, aby zweryfikować sesję użytkownika.
-   SDK automatycznie odświeża Access Token przy użyciu Refresh Tokena, zapewniając ciągłość sesji bez konieczności ponownego logowania (do momentu wygaśnięcia Refresh Tokena).

### 4.3. Modele Danych

-   Supabase automatycznie tworzy tabelę `auth.users` do przechowywania danych użytkowników.
-   Istniejące tabele (np. `folders`, `flashcards`) będą musiały zostać rozszerzone o kolumnę `user_id` (typu `UUID`) z kluczem obcym do `auth.users.id`.
-   Zostaną włączone i skonfigurowane polityki **Row Level Security (RLS)** na tabelach `folders` i `flashcards`, aby zapewnić, że użytkownicy mogą odczytywać i modyfikować wyłącznie własne dane.
    -   **Przykład polityki RLS dla tabeli `folders`**:
        -   `CREATE`: Użytkownik może dodać folder, jeśli `auth.uid() = user_id`.
        -   `SELECT`: Użytkownik może odczytać folder, jeśli `auth.uid() = user_id`.
        -   `UPDATE/DELETE`: Użytkownik może modyfikować/usuwać folder, jeśli `auth.uid() = user_id`.
