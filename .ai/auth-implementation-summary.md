# Dokumentacja Implementacji: System Autoryzacji

## Przegląd

System autoryzacji został zaimplementowany z wykorzystaniem **Supabase Auth** i **Astro SSR**. 

Data implementacji: 16 października 2025
Status: ✅ **Działający system logowania**

---

## Architektura

### Stack Technologiczny
- **Backend**: Astro 5 (SSR mode)
- **Auth Provider**: Supabase Auth (lokalna instancja)
- **Frontend**: React 19 + TypeScript 5
- **Walidacja**: Zod
- **UI**: Shadcn/ui + Tailwind CSS 4

### Przepływ Autoryzacji

```
1. Użytkownik → /login (LoginForm.tsx)
2. Submit → POST /api/auth/login
3. API → Supabase Auth (signInWithPassword)
4. Sukces → Set cookies (HttpOnly, Secure, SameSite)
5. Redirect → /dashboard
6. Każde żądanie → Middleware sprawdza sesję
7. Middleware → createSupabaseServerInstance → getUser()
8. User data → Astro.locals.user
```

---

## Struktura Plików

### Backend (Astro SSR)

```
src/
├── db/
│   └── supabase.client.ts          # Server & client Supabase instances
├── middleware/
│   └── index.ts                    # Auth middleware (sprawdza sesję)
├── pages/
│   ├── api/
│   │   └── auth/
│   │       ├── login.ts            # POST endpoint logowania
│   │       └── logout.ts           # POST endpoint wylogowania
│   ├── login.astro                 # Strona logowania (SSR)
│   └── dashboard.astro             # Chroniona strona (SSR)
└── env.d.ts                        # TypeScript types (Astro.locals)
```

### Frontend (React Components)

```
src/
├── components/
│   └── auth/
│       └── LoginForm.tsx           # Formularz logowania
└── layouts/
    └── AuthLayout.astro            # Layout dla zalogowanych (z logout)
```

---

## Kluczowe Funkcje

### 1. `createSupabaseServerInstance()` 
**Plik**: `src/db/supabase.client.ts`

Server-side Supabase client z obsługą cookies przez `@supabase/ssr`.

**Używany w**:
- Middleware (`src/middleware/index.ts`)
- API endpoints (`src/pages/api/auth/*.ts`)

**Kluczowe cechy**:
- `getAll()` / `setAll()` dla cookies (wymagane przez Supabase SSR)
- Parser dla header `Cookie`
- Opcje cookies: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`

### 2. Middleware Autoryzacji
**Plik**: `src/middleware/index.ts`

Sprawdza sesję użytkownika przy każdym żądaniu.

**Logika**:
1. Tworzy server-side Supabase client
2. Wywołuje `supabase.auth.getUser()`
3. Jeśli użytkownik zalogowany → zapisuje w `locals.user`
4. Jeśli niezalogowany na chronionej trasie → redirect `/login`
5. Jeśli zalogowany na stronie gości → redirect `/dashboard`

**Publiczne ścieżki** (nie wymagają auth):
- `/`, `/login`, `/register`, `/forgot-password`, `/password-reset`
- `/api/auth/*`

**Chronione ścieżki** (wymagają auth):
- `/dashboard`, `/folders/*`, `/study/*`, `/generate`, `/manual-save`, `/users`

### 3. API Endpoint Logowania
**Plik**: `src/pages/api/auth/login.ts`

**Request**:
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (sukces)**:
```json
200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Response (błąd)**:
```json
401 Unauthorized
{
  "error": "Nieprawidłowy email lub hasło"
}
```

**Walidacja** (Zod):
- Email: format email (regex)
- Password: niepuste pole

### 4. API Endpoint Wylogowania
**Plik**: `src/pages/api/auth/logout.ts`

**Request**:
```
POST /api/auth/logout
```

**Response**:
```
204 No Content
```

**Logika**:
1. Wywołuje `supabase.auth.signOut()`
2. Czyści cookies sesji
3. Zwraca pustą odpowiedź

### 5. LoginForm Component
**Plik**: `src/components/auth/LoginForm.tsx`

React component z:
- Walidacją w czasie rzeczywistym (on-blur)
- Walidacją formatu email (regex)
- Sprawdzaniem pustych pól
- Loading state podczas submitu
- Wyświetlaniem błędów inline i globalnych
- Integracją z API endpoint

**Flow**:
1. User wprowadza dane
2. Walidacja on-blur dla każdego pola
3. Submit → `fetch('/api/auth/login')`
4. Sukces → `window.location.href = '/dashboard'`
5. Błąd → Wyświetl komunikat w UI

### 6. AuthLayout
**Plik**: `src/layouts/AuthLayout.astro`

Layout dla stron wymagających autoryzacji.

**Zawiera**:
- Nawigację z linkami (Dashboard, Generuj, Dodaj fiszkę)
- Wyświetlanie emaila użytkownika (`Astro.locals.user.email`)
- Przycisk wylogowania z obsługą JavaScript

---

## TypeScript Types

### Astro.locals.user

```typescript
// src/env.d.ts
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
```

**Dostęp**:
```astro
---
const { user } = Astro.locals;
if (!user) return Astro.redirect('/login');
---
<h1>Witaj, {user.email}!</h1>
```

---

## Konfiguracja Środowiska

### .env

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGc...
```

### Supabase Local

**Wymagane**:
1. Supabase CLI zainstalowany
2. Lokalny Supabase uruchomiony: `npx supabase start`
3. Email provider włączony w Auth settings
4. Użytkownik testowy utworzony

**Studio URL**: http://127.0.0.1:54323

---

## Testowanie

### Scenariusze Testowe

#### ✅ Test 1: Logowanie z poprawnymi danymi
1. Wejdź na `/login`
2. Wprowadź: `test@example.com` / `Test1234!`
3. Kliknij "Zaloguj się"
4. Oczekiwane: Przekierowanie na `/dashboard`

#### ✅ Test 2: Logowanie z błędnymi danymi
1. Wejdź na `/login`
2. Wprowadź: `wrong@example.com` / `wrongpass`
3. Kliknij "Zaloguj się"
4. Oczekiwane: Komunikat "Nieprawidłowy email lub hasło"

#### ✅ Test 3: Walidacja formularza
1. Wejdź na `/login`
2. Wprowadź nieprawidłowy email: `notemail`
3. Opuść pole (blur)
4. Oczekiwane: Komunikat "Wprowadź poprawny adres email"

#### ✅ Test 4: Ochrona tras (niezalogowany)
1. Będąc niezalogowanym, wejdź na `/dashboard`
2. Oczekiwane: Przekierowanie na `/login`

#### ✅ Test 5: Ochrona tras (zalogowany)
1. Będąc zalogowanym, wejdź na `/login`
2. Oczekiwane: Przekierowanie na `/dashboard`

#### ✅ Test 6: Wylogowanie
1. Będąc zalogowanym na `/dashboard`
2. Kliknij "Wyloguj" w nawigacji
3. Oczekiwane: Przekierowanie na `/login`
4. Sprawdź: Sesja wyczyszczona (nie można wejść na `/dashboard`)

---

## Bezpieczeństwo

### Zaimplementowane Zabezpieczenia

1. **JWT-based Authentication**
   - Tokeny zarządzane przez Supabase Auth
   - Automatyczne odświeżanie tokenów

2. **Secure Cookies**
   - `httpOnly: true` (nie dostępne dla JavaScript)
   - `secure: true` (tylko HTTPS w production)
   - `sameSite: 'lax'` (ochrona CSRF)

3. **Server-Side Validation**
   - Walidacja Zod w API endpoints
   - Sprawdzanie sesji w middleware

4. **Protection Against**
   - XSS (HttpOnly cookies)
   - CSRF (SameSite cookies)
   - Session hijacking (Secure cookies)

### Potencjalne Ulepszenia

- [ ] Rate limiting (ograniczenie prób logowania)
- [ ] CSRF tokens
- [ ] Email verification
- [ ] 2FA (Two-Factor Authentication)
- [ ] Password complexity requirements (w UI)
- [ ] Account lockout po wielu nieudanych próbach

---

## Troubleshooting

### Problem: "Invalid login credentials"

**Przyczyny**:
1. Użytkownik nie istnieje w bazie
2. Nieprawidłowe hasło
3. Użytkownik nie jest potwierdzony (Auto Confirm wyłączony)

**Rozwiązanie**:
1. Sprawdź w Supabase Studio → Authentication → Users
2. Upewnij się, że "Email Confirmed At" ma wartość
3. Jeśli nie, usuń i utwórz ponownie z "Auto Confirm User" ✅

### Problem: Middleware nie przekierowuje

**Przyczyny**:
1. `prerender = false` nie ustawione na stronie
2. Middleware nie jest uruchomiony
3. Błąd w parsowaniu cookies

**Rozwiązanie**:
1. Dodaj `export const prerender = false;` w `.astro` files
2. Sprawdź logi terminala z `npm run dev`
3. Sprawdź DevTools → Network → Cookies

### Problem: Cookies nie są ustawiane

**Przyczyny**:
1. CORS issues (jeśli API na innej domenie)
2. `secure: true` w development (używaj HTTP)

**Rozwiązanie**:
1. W development: URL musi być `http://localhost` (nie `https`)
2. Sprawdź `cookieOptions` w `supabase.client.ts`

### Problem: "Cannot read properties of undefined (reading 'email')"

**Przyczyny**:
1. `Astro.locals.user` nie jest ustawiony
2. Middleware nie działa poprawnie

**Rozwiązanie**:
1. Sprawdź czy middleware jest załadowany
2. Dodaj optional chaining: `user?.email`
3. Sprawdź konsole - czy są błędy w middleware?

---

## Roadmap

### ✅ Zrealizowane
- [x] Server-side Supabase client
- [x] Middleware autoryzacji
- [x] API login endpoint
- [x] API logout endpoint
- [x] LoginForm component
- [x] Ochrona tras
- [x] Wylogowanie w UI

### 🚧 W Planach (Kolejne Etapy)
- [ ] Rejestracja użytkowników (US-007)
- [ ] Odzyskiwanie hasła (US-008)
- [ ] Email verification
- [ ] Toast notifications
- [ ] Profile dropdown menu
- [ ] Rate limiting
- [ ] 2FA

---

## Kontakt i Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź logi terminala (`npm run dev`)
2. Sprawdź Supabase Studio → Authentication
3. Sprawdź Browser DevTools → Network & Console
4. Przejrzyj ten dokument (sekcja Troubleshooting)

Dokumentacja Supabase Auth:
https://supabase.com/docs/guides/auth

Dokumentacja Astro Middleware:
https://docs.astro.build/en/guides/middleware/

---

**Ostatnia aktualizacja**: 16 października 2025
**Status**: ✅ Produkcyjne (ready for testing)
