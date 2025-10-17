# 📚 Dokumentacja Testów API Logowania

## 📄 Informacje o pliku testowym

- **Plik źródłowy:** `src/pages/api/auth/login.ts`
- **Plik testowy:** `src/pages/api/auth/__tests__/login.test.ts`
- **Framework:** Vitest
- **Data utworzenia:** 17 października 2025
- **Liczba testów:** 20

## 🎯 Cel testów

Testy jednostkowe dla endpointu API logowania zapewniają:
- Walidację danych wejściowych (email i hasło)
- Poprawną integrację z Supabase Auth
- Obsługę błędów i komunikatów w języku polskim
- Bezpieczeństwo danych użytkownika (filtracja wrażliwych informacji)

## 👤 Testowy użytkownik

```
Email: example5@example.pl
Hasło: Haslo123@
```

## 📊 Pokrycie testowe

### 1. Scenariusze pozytywne (2 testy)

#### ✅ Test: Poprawne logowanie z danymi testowego użytkownika
**Opis:** Weryfikuje czy użytkownik może się zalogować z poprawnymi danymi.

**Kroki:**
1. Wysłanie żądania POST z prawidłowymi credentials
2. Mock Supabase zwraca dane użytkownika
3. Weryfikacja odpowiedzi 200 OK

**Oczekiwany rezultat:**
```json
{
  "user": {
    "id": "test-user-id-123",
    "email": "example5@example.pl"
  }
}
```

**Asercje:**
- Status odpowiedzi: `200`
- Zwrócone dane zawierają tylko `id` i `email`
- `signInWithPassword` wywołane raz z poprawnymi danymi

---

#### ✅ Test: Weryfikacja wewnętrznego użycia trim() dla emaila
**Opis:** Potwierdza, że email jest trimowany wewnętrznie po przejściu walidacji.

**Reguła biznesowa:** Email jest trimowany przed przekazaniem do Supabase, aby zapobiec problemom z białymi znakami w bazie danych.

**Asercje:**
- `signInWithPassword` otrzymuje prawidłowo sformatowany email bez dodatkowych białych znaków

---

### 2. Walidacja danych wejściowych (6 testów)

#### ❌ Test: Brak emaila
**Opis:** Weryfikuje odrzucenie żądania bez pola email.

**Dane wejściowe:**
```json
{
  "password": "Haslo123@"
}
```

**Oczekiwany rezultat:**
- Status: `400`
- Error: zawiera komunikat o błędzie
- Supabase NIE jest wywoływany

---

#### ❌ Test: Nieprawidłowy format emaila
**Opis:** Weryfikuje odrzucenie emaila w nieprawidłowym formacie.

**Przykład:** `"invalid-email-format"`

**Oczekiwany rezultat:**
- Status: `400`
- Error: `"Nieprawidłowy format adresu email"`
- Supabase NIE jest wywoływany

**Reguła walidacji:** Email musi być zgodny ze standardem RFC (sprawdzane przez Zod)

---

#### ❌ Test: Email z białymi znakami na początku/końcu
**Opis:** Weryfikuje odrzucenie emaila z leading/trailing whitespace.

**Przykład:** `"  example5@example.pl  "`

**Oczekiwany rezultat:**
- Status: `400`
- Error: `"Nieprawidłowy format adresu email"`
- Supabase NIE jest wywoływany

**Reguła walidacji:** Zod email validator nie akceptuje białych znaków

---

#### ❌ Test: Brak hasła
**Opis:** Weryfikuje odrzucenie żądania bez pola password.

**Dane wejściowe:**
```json
{
  "email": "example5@example.pl"
}
```

**Oczekiwany rezultat:**
- Status: `400`
- Error: zawiera komunikat o błędzie
- Supabase NIE jest wywoływany

---

#### ❌ Test: Puste hasło
**Opis:** Weryfikuje odrzucenie pustego stringa jako hasła.

**Dane wejściowe:**
```json
{
  "email": "example5@example.pl",
  "password": ""
}
```

**Oczekiwany rezultat:**
- Status: `400`
- Error: `"Hasło jest wymagane"`

**Reguła walidacji:** `z.string().min(1)` - hasło musi mieć przynajmniej 1 znak

---

#### ❌ Test: Brak obu pól
**Opis:** Weryfikuje odrzucenie pustego obiektu JSON.

**Dane wejściowe:**
```json
{}
```

**Oczekiwany rezultat:**
- Status: `400`
- Error: zawiera komunikat o błędzie
- Supabase NIE jest wywoływany

---

### 3. Błędy uwierzytelniania (3 testy)

#### 🔒 Test: Nieprawidłowe dane logowania (z polskim komunikatem)
**Opis:** Weryfikuje tłumaczenie błędu "Invalid login credentials" na język polski.

**Scenariusz:** Użytkownik podaje nieprawidłowe hasło.

**Oczekiwany rezultat:**
- Status: `401`
- Error: `"Nieprawidłowy email lub hasło"`

**Reguła biznesowa:** Komunikaty błędów są wyświetlane po polsku dla lepszego UX.

---

#### 🔒 Test: Nieistniejący użytkownik
**Opis:** Weryfikuje zachowanie przy próbie logowania nieistniejącego użytkownika.

**Przykład emaila:** `"nonexistent@example.pl"`

**Oczekiwany rezultat:**
- Status: `401`
- Error: `"Nieprawidłowy email lub hasło"`

**Reguła bezpieczeństwa:** Nie ujawniamy, czy użytkownik istnieje w systemie.

---

#### 🔒 Test: Inne błędy Supabase
**Opis:** Weryfikuje przekazywanie oryginalnych komunikatów dla błędów nie związanych z credentials.

**Przykład błędu:** `"Email not confirmed"`

**Oczekiwany rezultat:**
- Status: `401`
- Error: `"Email not confirmed"` (oryginalny komunikat)

**Reguła:** Tylko błąd "Invalid login credentials" jest tłumaczony na polski.

---

### 4. Błędy serwera (3 testy)

#### 💥 Test: Nieprawidłowy format JSON
**Opis:** Weryfikuje obsługę błędów parsowania JSON.

**Dane wejściowe:** `"invalid-json{"`

**Oczekiwany rezultat:**
- Status: `500`
- Error: `"Wystąpił błąd podczas logowania"`
- Supabase NIE jest wywoływany

**Obsługa błędu:** Try-catch łapie SyntaxError z `request.json()`

---

#### 💥 Test: Nieoczekiwane błędy Supabase
**Opis:** Weryfikuje obsługę wyjątków rzuconych przez Supabase client.

**Symulowany błąd:** `new Error("Network error")`

**Oczekiwany rezultat:**
- Status: `500`
- Error: `"Wystąpił błąd podczas logowania"`

**Obsługa błędu:** Główny try-catch łapie wszystkie nieobsłużone błędy.

---

#### 📝 Test: Logowanie błędów do konsoli
**Opis:** Weryfikuje czy błędy są logowane dla celów debugowania.

**Oczekiwane zachowanie:**
- `console.error("Login error:", error)` jest wywoływany
- Ułatwia diagnozowanie problemów w produkcji

---

### 5. Walidacja formatu odpowiedzi (3 testy)

#### 📤 Test: Poprawny Content-Type dla sukcesu
**Opis:** Weryfikuje nagłówek Content-Type w odpowiedzi sukcesu.

**Oczekiwany nagłówek:** `Content-Type: application/json`

---

#### 📤 Test: Poprawny Content-Type dla błędów
**Opis:** Weryfikuje nagłówek Content-Type w odpowiedzi błędu.

**Oczekiwany nagłówek:** `Content-Type: application/json`

---

#### 🔒 Test: Filtracja danych użytkownika
**Opis:** Weryfikuje że tylko niezbędne dane są zwracane do klienta.

**Dane zwrócone przez Supabase:**
```typescript
{
  user: {
    id: "test-user-id",
    email: "example5@example.pl",
    aud: "authenticated",
    role: "authenticated",
    phone: "+48123456789",
    created_at: "2024-01-01"
  },
  session: {
    access_token: "secret-token",
    refresh_token: "secret-refresh"
  }
}
```

**Dane zwrócone do klienta:**
```json
{
  "user": {
    "id": "test-user-id",
    "email": "example5@example.pl"
  }
}
```

**Reguła bezpieczeństwa:** Tokeny i wrażliwe dane NIE są zwracane w response body (są ustawiane jako HTTP-only cookies przez Supabase).

---

### 6. Przypadki brzegowe (3 testy)

#### 🔤 Test: Email ze znakami specjalnymi
**Opis:** Weryfikuje obsługę emaili z `+` i innymi dozwolonymi znakami.

**Przykład:** `"user+test@example.pl"`

**Oczekiwany rezultat:**
- Status: `200`
- Email poprawnie przetworzony

**Reguła:** RFC 5322 pozwala na znaki specjalne w lokalnej części emaila.

---

#### 🔐 Test: Hasło ze znakami specjalnymi
**Opis:** Weryfikuje obsługę haseł ze znakami specjalnymi.

**Przykład:** `"P@$$w0rd!#%&*()"`

**Oczekiwany rezultat:**
- Status: `200`
- Hasło przekazane do Supabase bez zmian

**Reguła:** Hasło NIE jest sanityzowane - przekazywane jak jest.

---

#### 📏 Test: Bardzo długi email
**Opis:** Weryfikuje obsługę długich adresów email.

**Przykład:** `"aaaaaaaaaa...@exampleexampleexample...com"` (100+ znaków)

**Oczekiwany rezultat:**
- Status: `200`
- Długi email poprawnie przetworzony

---

## 🛠️ Techniczne szczegóły testów

### Mock Configuration

```typescript
vi.mock("@/db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
}));
```

### BeforeEach Setup

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock cookies
  mockCookies = {
    set: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
    headers: vi.fn(),
  };
  
  // Mock Supabase client
  mockSupabaseClient = {
    auth: {
      signInWithPassword: vi.fn(),
    },
  };
  
  (createSupabaseServerInstance as Mock).mockReturnValue(mockSupabaseClient);
});
```

### Struktura testu (AAA Pattern)

```typescript
it("should test something", async () => {
  // Arrange - Przygotowanie danych
  const credentials = {
    email: "example5@example.pl",
    password: "Haslo123@",
  };
  
  mockRequest = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  
  // Act - Wykonanie akcji
  const response = await POST(context as APIContext);
  const responseData = await response.json();
  
  // Assert - Weryfikacja rezultatów
  expect(response.status).toBe(200);
  expect(responseData.user.email).toBe("example5@example.pl");
});
```

## 📋 Schema walidacji (Zod)

```typescript
const loginSchema = z.object({
  email: z.string().email({ 
    message: "Nieprawidłowy format adresu email" 
  }),
  password: z.string().min(1, { 
    message: "Hasło jest wymagane" 
  }),
});
```

## 🔍 Kluczowe reguły biznesowe testowane

1. **Walidacja email:**
   - Musi być w poprawnym formacie (RFC 5322)
   - Nie może zawierać białych znaków na początku/końcu
   - Może zawierać znaki specjalne (`+`, `.`, `-`)

2. **Walidacja hasła:**
   - Nie może być puste (min 1 znak)
   - Nie ma maksymalnej długości w API (Supabase ma swoje limity)
   - Znaki specjalne są dozwolone

3. **Bezpieczeństwo:**
   - Nie ujawniamy czy użytkownik istnieje w systemie
   - Tokeny NIE są zwracane w JSON response
   - Tylko `id` i `email` są zwracane do klienta

4. **Komunikaty błędów:**
   - Błędy walidacji po polsku
   - "Invalid login credentials" tłumaczony na polski
   - Inne błędy Supabase zachowują oryginalne komunikaty

5. **Obsługa błędów:**
   - Wszystkie błędy są łapane przez try-catch
   - Błędy są logowane do konsoli
   - Generyczny komunikat dla błędów serwera (500)

## 🚀 Uruchamianie testów

### Wszystkie testy logowania:
```bash
npm test -- login.test.ts
```

### W trybie watch:
```bash
npm test -- login.test.ts --watch
```

### Z pokryciem kodu:
```bash
npm test -- login.test.ts --coverage
```

### Konkretny test:
```bash
npm test -- login.test.ts -t "should successfully login"
```

## 📈 Metryki pokrycia

| Kategoria | Liczba testów |
|-----------|---------------|
| **Scenariusze pozytywne** | 2 |
| **Walidacja** | 6 |
| **Błędy auth** | 3 |
| **Błędy serwera** | 3 |
| **Format odpowiedzi** | 3 |
| **Edge cases** | 3 |
| **TOTAL** | **20** |

## ✅ Status testów

```
✓ POST /api/auth/login (20 tests)
  ✓ Successful login scenarios (2)
  ✓ Validation errors (6)
  ✓ Authentication errors (3)
  ✓ Server errors (3)
  ✓ Response format validation (3)
  ✓ Edge cases (3)
```

## 🔗 Powiązane pliki

- 📄 **Implementacja:** `src/pages/api/auth/login.ts`
- 🧪 **Testy:** `src/pages/api/auth/__tests__/login.test.ts`
- 🔧 **Konfiguracja:** `vitest.config.ts`
- 🗄️ **Supabase Client:** `src/db/supabase.client.ts`
- 📚 **Setup testów:** `src/__tests__/setup.ts`

## 📝 Notatki

- Testy używają mocków dla Supabase client - nie wykonują rzeczywistych zapytań do bazy
- Wszystkie testy są izolowane - każdy test resetuje mocki
- Testy sprawdzają zarówno happy path jak i edge cases
- Komunikaty błędów są w języku polskim dla lepszego UX

---

**Ostatnia aktualizacja:** 17 października 2025  
**Autor testów:** AI Programming Assistant  
**Framework:** Vitest v3.2.4
