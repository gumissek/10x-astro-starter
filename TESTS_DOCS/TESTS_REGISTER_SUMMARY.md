# Dokumentacja Testów - API Registration Endpoint

## Podsumowanie

Testy jednostkowe dla endpointu rejestracji użytkowników (`/api/auth/register`) weryfikują kluczowe funkcjonal### 3. Type Safety
- Pełne typowanie TypeScript w testach
- Użycie `type Mock` z Vitest
- Type-safe mock responses
- Poprawne mockowanie `APIContext` z `locals`, `cookies` i `request`i, walidację danych oraz obsługę błędów. Wszystkie 36 testów przechodzą pomyślnie.

## Struktura Testów

### 1. Successful Registration Scenarios (3 testy)
Weryfikacja prawidłowej rejestracji użytkowników:

- ✅ **Rejestracja z poprawnymi danymi**
  - Sprawdza czy użytkownik zostaje utworzony z prawidłowymi credentials
  - Weryfikuje poprawność zwracanych danych (id, email)
  - Potwierdza wywołanie Supabase z odpowiednimi parametrami

- ✅ **Odrzucanie email z białymi znakami**
  - Email z leading/trailing spacjami nie przechodzi walidacji Zod
  - Status 400 z odpowiednim komunikatem błędu
  - Supabase nie jest wywoływany

- ✅ **Obsługa haseł ze znakami specjalnymi**
  - Akceptuje wszystkie dozwolone znaki specjalne: `!@#$%^&*()`
  - Hasło jest przekazywane bez modyfikacji do Supabase

### 2. Validation Errors - Email (4 testy)
Walidacja pola email:

- ✅ **Brak email** - zwraca błąd z polem "email"
- ✅ **Pusty string email** - komunikat "Email jest wymagany"
- ✅ **Nieprawidłowy format email** - walidacja Zod sprawdza format
- ✅ **Email bez symbolu @** - odrzucany przez walidację

### 3. Validation Errors - Password (7 testów)
Walidacja hasła zgodnie z polityką bezpieczeństwa:

- ✅ **Brak hasła** - zwraca błąd walidacji
- ✅ **Hasło za krótkie (<8 znaków)** - "Hasło musi mieć minimum 8 znaków"
- ✅ **Brak wielkiej litery** - "Hasło musi zawierać co najmniej jedną wielką literę"
- ✅ **Brak cyfry** - "Hasło musi zawierać co najmniej jedną cyfrę"
- ✅ **Brak znaku specjalnego** - "Hasło musi zawierać co najmniej jeden znak specjalny"
- ✅ **Brak confirmPassword** - zwraca błąd walidacji
- ✅ **Niezgodność haseł** - "Hasła muszą być identyczne"

**Wymagania hasła:**
- Minimum 8 znaków
- Przynajmniej jedna wielka litera
- Przynajmniej jedna cyfra
- Przynajmniej jeden znak specjalny: `!@#$%^&*(),.?":{}|<>`

### 4. Registration Errors - Existing User (2 testy)
Obsługa użytkownika, który już istnieje w systemie:

- ✅ **Testowy użytkownik już zarejestrowany**
  - Email: `example5@example.pl`
  - Password: `Haslo123@`
  - Zwraca: "Ten adres email jest już zarejestrowany"
  
- ✅ **Warianty komunikatów błędów Supabase**
  - "User already registered"
  - "Email already registered with another provider"
  - Oba przypadki zwracają ten sam Polski komunikat

### 5. Registration Errors - Supabase Validation (3 testy)
Obsługa błędów walidacji po stronie Supabase:

- ✅ **Błąd walidacji hasła Supabase** - "Hasło nie spełnia wymagań bezpieczeństwa"
- ✅ **Błąd walidacji email Supabase** - komunikat zawiera fragment "adres email"
- ✅ **Nieznany błąd Supabase** - "Wystąpił błąd podczas rejestracji"

### 6. Registration Errors - Missing User or Session (3 testy)
Weryfikacja kompletności danych po rejestracji:

- ✅ **Brak obiektu user** - błąd 500: "Nie udało się utworzyć konta"
- ✅ **Brak session** - błąd 500: "Nie udało się utworzyć konta"
- ✅ **Brak user i session** - błąd 500: "Nie udało się utworzyć konta"

### 7. Server Errors (2 testy)
Obsługa błędów serwera i sieci:

- ✅ **Nieprawidłowy JSON** - błąd 500: "Wystąpił nieoczekiwany błąd"
- ✅ **Błąd Supabase client** - błąd 500 przy awarii sieci

### 8. Response Format Validation (4 testy)
Weryfikacja formatu odpowiedzi:

- ✅ **Content-Type dla sukcesu** - `application/json`
- ✅ **Content-Type dla błędu** - `application/json`
- ✅ **Bezpieczeństwo danych użytkownika** - zwraca tylko `id` i `email`, nie zwraca `session`, `aud`, `role`, `phone`
- ✅ **Pole "field" w błędach walidacji** - wskazuje które pole jest nieprawidłowe

### 9. Edge Cases (6 testów)
Obsługa przypadków brzegowych:

- ✅ **Email z plus addressing** - `user+test@example.pl` jest akceptowany
- ✅ **Bardzo długi email** - 50+ znaków w lokalnej części
- ✅ **Hasło o minimalnej długości** - dokładnie 8 znaków z wymaganymi typami
- ✅ **Hasło ze wszystkimi typami znaków** - wielkie, małe, cyfry, specjalne
- ✅ **Międzynarodowe znaki w email** - Zod walidacja odrzuca znaki unicode
  - Test dokumentuje obecne zachowanie (zwraca 400)
  - Jest to ograniczenie biblioteki Zod

### 10. Business Logic Validation (3 testy)
Weryfikacja logiki biznesowej:

- ✅ **Parametry createSupabaseServerInstance** - przekazuje cookies, headers i env (z locals.runtime)
- ✅ **Kolejność walidacji** - Zod waliduje PRZED wywołaniem Supabase
- ✅ **Wyłączenie potwierdzenia email** - `emailRedirectTo: undefined`

## Kluczowe Reguły Biznesowe

### 1. Walidacja Danych
- Walidacja Zod wykonywana PRZED wywołaniem Supabase
- Email musi być w poprawnym formacie (bez białych znaków)
- Hasło musi spełniać wszystkie wymagania bezpieczeństwa
- Potwierdzenie hasła musi być identyczne z hasłem

### 2. Polityka Haseł
```typescript
- Minimum: 8 znaków
- Wymagane: [A-Z] - wielka litera
- Wymagane: [0-9] - cyfra  
- Wymagane: [!@#$%^&*(),.?":{}|<>] - znak specjalny
```

### 3. Automatyczne Logowanie
- Email confirmation jest wyłączone (`emailRedirectTo: undefined`)
- Użytkownik otrzymuje session natychmiast po rejestracji
- Sprawdzana jest obecność zarówno `user` jak i `session`

### 4. Bezpieczeństwo
- Zwracane są tylko niezbędne dane: `id`, `email`
- Nie są zwracane: `session`, `access_token`, `refresh_token`, metadata
- Email jest trimowany przed zapisem do bazy
- Hasła nie są logowane ani zwracane

### 5. Obsługa Błędów
- Błędy walidacji: 400 z polskim komunikatem i polem które jest nieprawidłowe
- Użytkownik już istnieje: 400 z polskim komunikatem
- Błędy Supabase: 400 z odpowiednim polskim komunikatem
- Błędy serwera: 500 z ogólnym polskim komunikatem

## Testowy Użytkownik

Wykorzystywany w testach scenariusza "użytkownik już istnieje":

```typescript
Email: example5@example.pl
Password: Haslo123@
```

## Pokrycie Kodu

Testy pokrywają:
- ✅ Wszystkie ścieżki walidacji Zod
- ✅ Wszystkie typy błędów Supabase
- ✅ Obsługę wyjątków i błędów sieci
- ✅ Warunki brzegowe i przypadki specjalne
- ✅ Formatowanie i bezpieczeństwo odpowiedzi

## Wzorce Testowe (zgodnie z Vitest Best Practices)

### 1. Mock Pattern
```typescript
vi.mock("@/db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
}));
```

### 2. BeforeEach Setup
- Reset wszystkich mocków przed każdym testem
- Świeża konfiguracja mock cookies, locals z runtime env i Supabase client
- Zapewnienie izolacji testów
- Mock `locals.runtime.env` zawiera `SUPABASE_URL` i `SUPABASE_KEY`

### 3. Arrange-Act-Assert Pattern
Każdy test jest strukturyzowany:
```typescript
// Arrange - przygotowanie danych i mocków
// Act - wywołanie testowanej funkcji
// Assert - weryfikacja rezultatu
```

### 4. Type Safety
- Pełne typowanie TypeScript w testach
- Użycie `type Mock` z Vitest
- Type-safe mock responses

### 5. Descriptive Test Names
- Nazwy testów opisują DOKŁADNIE co jest testowane
- Format: "should [expected behavior] when [condition]"

## Uruchomienie Testów

```powershell
# Uruchom tylko testy rejestracji
npm test -- register.test.ts

# Uruchom z watch mode
npm test -- register.test.ts --watch

# Uruchom z coverage
npm test -- register.test.ts --coverage
```

## Struktura Plików

```
src/pages/api/auth/
├── register.ts                    # Endpoint rejestracji
└── __tests__/
    └── register.test.ts           # 36 testów jednostkowych
```

## Ważne Uwagi Techniczne

### Mockowanie dla Cloudflare Workers
Endpoint register.ts jest przygotowany do deploy na Cloudflare Workers, co wymaga specjalnego podejścia do zmiennych środowiskowych:

```typescript
// W testach mockujemy locals.runtime.env
mockLocals = {
  runtime: {
    env: {
      SUPABASE_URL: "https://test.supabase.co",
      SUPABASE_KEY: "test-key",
    },
  },
} as unknown as APIContext["locals"];
```

Implementacja w register.ts:
```typescript
// Pobierz zmienne środowiskowe z runtime (dla Cloudflare) lub z import.meta.env (dla lokalnego devu)
const env = locals.runtime?.env || {
  SUPABASE_URL: import.meta.env.SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
};
```

To zapewnia, że:
1. Testy działają poprawnie z mockowanymi wartościami
2. Kod działa na Cloudflare Workers (używa `locals.runtime.env`)
3. Kod działa lokalnie (używa `import.meta.env` jako fallback)

## Zależności

- `vitest` - Framework testowy
- `zod` - Walidacja schematu
- `@supabase/supabase-js` - Klient Supabase (mockowany)
- `astro` - Typy APIContext

## Metryki

- **Liczba testów:** 36
- **Status:** ✅ Wszystkie przechodzą
- **Czas wykonania:** ~43ms
- **Grupy testowe:** 10
- **Pokrycie:** Kompletne (wszystkie ścieżki kodu)

## Kolejne Kroki

### Potencjalne Ulepszenia:
1. ~~Dodać testy E2E z prawdziwą bazą danych~~ (Playwright)
2. Rozważyć dodanie rate limiting dla rejestracji
3. Dodać testy load/stress testing dla endpoint
4. Rozważyć wsparcie dla międzynarodowych znaków w email (wymaga zmiany w Zod)
5. Dodać metryki czasu odpowiedzi

---

**Data utworzenia:** 17 października 2025  
**Ostatnia aktualizacja:** 22 października 2025  
**Wersja:** 1.1.0  
**Changelog v1.1.0:** Naprawiono wszystkie testy - dodano poprawne mockowanie `locals` z `runtime.env` dla kompatybilności z Cloudflare Workers
