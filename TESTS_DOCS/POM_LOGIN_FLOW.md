# Page Object Model (POM) - Login Flow

## 📚 Przegląd

Klasy Page Object Model dla scenariusza logowania i dostępu do dashboardu, zgodnie z wytycznymi Playwright i wzorcem **Arrange-Act-Assert**.

## 🏗️ Struktura

```
e2e/
├── pages/
│   ├── BasePage.ts           # Bazowa klasa dla wszystkich POM
│   ├── LoginPage.ts           # POM dla strony logowania
│   ├── DashboardPage.ts       # POM dla strony dashboardu
│   └── index.ts               # Export wszystkich POM
├── login.spec.ts              # Testy E2E dla logowania
└── fixtures/
```

## 📋 Klasy POM

### 1. **BasePage**
Bazowa klasa zawierająca wspólne metody dla wszystkich Page Objects.

**Metody:**
- `goto(path)` - Nawigacja do ścieżki
- `waitForLoadState(state)` - Oczekiwanie na stan załadowania
- `screenshot(name)` - Zrobienie screenshota

---

### 2. **LoginPage**
Obsługuje wszystkie interakcje ze stroną logowania.

#### Lokatory (data-testid)
```typescript
pageContainer          // login-page-container
formContainer         // login-form-container
formTitle            // login-form-title
loginForm            // login-form
emailInput           // login-email-input
passwordInput        // login-password-input
emailErrorMessage    // email-error-message
passwordErrorMessage // password-error-message
generalErrorMessage  // login-error-message
submitButton         // login-submit-button
registerLink         // register-link
```

#### Metody akcji

**Nawigacja:**
- `navigate()` - Przejdź na stronę logowania
- `waitForPageLoad()` - Poczekaj na załadowanie strony

**Wypełnianie formularza:**
- `fillEmail(email: string)` - Wypełnij pole email
- `fillPassword(password: string)` - Wypełnij pole hasła
- `fillCredentials(email, password)` - Wypełnij oba pola

**Wysyłanie formularza:**
- `clickSubmit()` - Kliknij przycisk logowania
- `submitLogin(email, password)` - Wypełnij i wyślij formularz
- `login(email, password)` - Pełny proces logowania z oczekiwaniem na przekierowanie

**Nawigacja:**
- `clickRegisterLink()` - Kliknij link do rejestracji

**Sprawdzanie stanu:**
- `isSubmitButtonDisabled()` - Czy przycisk jest wyłączony
- `isSubmitButtonEnabled()` - Czy przycisk jest włączony
- `getSubmitButtonText()` - Pobierz tekst przycisku
- `isEmailErrorVisible()` - Czy błąd email jest widoczny
- `isPasswordErrorVisible()` - Czy błąd hasła jest widoczny
- `isGeneralErrorVisible()` - Czy błąd generalny jest widoczny
- `getEmailErrorText()` - Pobierz tekst błędu email
- `getPasswordErrorText()` - Pobierz tekst błędu hasła
- `getGeneralErrorText()` - Pobierz tekst błędu generalnego

#### Metody asercji
- `expectToBeOnLoginPage()` - Sprawdź czy jesteśmy na stronie logowania
- `expectFormTitleVisible()` - Sprawdź widoczność tytułu
- `expectEmailErrorToContain(text)` - Sprawdź komunikat błędu email
- `expectPasswordErrorToContain(text)` - Sprawdź komunikat błędu hasła
- `expectGeneralErrorToContain(text)` - Sprawdź komunikat błędu generalnego
- `expectSubmitButtonDisabled()` - Sprawdź czy przycisk jest wyłączony
- `expectSubmitButtonEnabled()` - Sprawdź czy przycisk jest włączony
- `expectSubmitButtonText(text)` - Sprawdź tekst przycisku

---

### 3. **DashboardPage**
Obsługuje wszystkie interakcje ze stroną dashboardu.

#### Lokatory (data-testid)
```typescript
dashboardContainer    // dashboard-container
dashboardTitle       // dashboard-title
generateCardsButton  // generate-cards-button
addCardButton        // add-card-button
```

#### Metody akcji

**Nawigacja:**
- `navigate()` - Przejdź na dashboard
- `waitForPageLoad()` - Poczekaj na załadowanie

**Akcje:**
- `clickGenerateCards()` - Kliknij "Generuj fiszki"
- `clickAddCard()` - Kliknij "Dodaj fiszkę"

**Sprawdzanie stanu:**
- `getDashboardTitle()` - Pobierz tytuł dashboardu
- `isDashboardVisible()` - Czy dashboard jest widoczny

#### Metody asercji
- `expectToBeOnDashboard()` - Sprawdź czy jesteśmy na dashboardzie
- `expectDashboardTitleVisible()` - Sprawdź widoczność tytułu
- `expectGenerateCardsButtonVisible()` - Sprawdź widoczność przycisku generowania
- `expectAddCardButtonVisible()` - Sprawdź widoczność przycisku dodawania
- `expectAllActionsVisible()` - Sprawdź widoczność wszystkich elementów

---

## 🧪 Przykłady użycia

### Podstawowy test logowania

```typescript
import { test } from '@playwright/test';
import { LoginPage, DashboardPage } from './pages';

test('should login successfully', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.navigate();
  
  // Act
  await loginPage.login('example5@example.pl', 'Haslo123@');
  
  // Assert
  await dashboardPage.expectToBeOnDashboard();
  await dashboardPage.expectAllActionsVisible();
});
```

### Test walidacji formularza

```typescript
test('should show validation errors', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Act
  await loginPage.fillEmail('invalid-email');
  await loginPage.fillPassword('Haslo123@');
  
  // Assert
  await loginPage.expectSubmitButtonDisabled();
  await loginPage.expectEmailErrorToContain('email');
});
```

### Test błędnych danych logowania

```typescript
test('should show error for invalid credentials', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Act
  await loginPage.submitLogin('wrong@example.pl', 'WrongPassword');
  
  // Assert
  await loginPage.expectGeneralErrorToContain('Nieprawidłowy email lub hasło');
  await loginPage.expectToBeOnLoginPage();
});
```

### Test pełnego scenariusza

```typescript
test('complete login flow - your scenario', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  // 1. Przejdź na stronę /login
  await loginPage.navigate();
  
  // 2. Poczekaj aż strona się załaduje
  await loginPage.waitForPageLoad();
  
  // 3. Uzupełnij pole email
  await loginPage.fillEmail('example5@example.pl');
  
  // 4. Uzupełnij pole hasło
  await loginPage.fillPassword('Haslo123@');
  
  // 5. Kliknij logowanie i poczekaj
  await loginPage.clickSubmit();
  
  // 6. Zobacz czy przeniesie na /dashboard
  await dashboardPage.expectToBeOnDashboard();
  await dashboardPage.expectDashboardTitleVisible();
});
```

## 🎯 Wzorzec Arrange-Act-Assert

Wszystkie testy wykorzystują wzorzec **AAA**:

1. **Arrange** - Przygotowanie (nawigacja, inicjalizacja POM)
2. **Act** - Akcja (wypełnienie formularza, kliknięcia)
3. **Assert** - Sprawdzenie (asercje z metodami `expect*`)

## ✅ Best Practices

1. **Używaj `data-testid`** - Wszystkie lokatory używają atrybutów `data-testid`
2. **Metody asercji** - Każdy POM ma dedykowane metody asercji `expect*`
3. **Czytelne nazwy** - Metody mają opisowe nazwy wskazujące co robią
4. **Separacja odpowiedzialności** - Każdy POM odpowiada za swoją stronę
5. **Reużywalność** - Metody pomocnicze jak `login()` łączą kroki
6. **TypeScript** - Pełne typowanie dla lepszej dokumentacji i bezpieczeństwa

## 🚀 Uruchomienie testów

```bash
# Wszystkie testy logowania
npx playwright test e2e/login.spec.ts

# Z widoczną przeglądarką
npx playwright test e2e/login.spec.ts --headed

# Pojedynczy test
npx playwright test e2e/login.spec.ts -g "should successfully login"

# Z debuggerem
npx playwright test e2e/login.spec.ts --debug

# Wygeneruj raport
npx playwright test e2e/login.spec.ts --reporter=html
```

## 📊 Pokrycie testowe

Utworzone testy E2E pokrywają:
- ✅ Pomyślne logowanie z prawidłowymi danymi
- ✅ Walidację formularza (email, hasło)
- ✅ Błędne dane logowania
- ✅ Stan przycisku podczas ładowania
- ✅ Nawigację do strony rejestracji
- ✅ Dostępność formularza (accessibility)
- ✅ Wyświetlanie dashboardu po logowaniu
- ✅ Nawigację do innych stron z dashboardu
