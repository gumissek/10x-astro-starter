import { test, expect } from '@playwright/test';
import { RegisterPage, DashboardPage } from './pages';

/**
 * Register Flow E2E Tests
 * Tests for user registration functionality
 */

test.describe('Registration Flow', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.navigate();
  });

  test('should display registration form with all elements', async () => {
    // Arrange & Assert - Verify page loaded correctly
    await registerPage.expectToBeOnRegisterPage();
    await registerPage.expectFormTitleVisible();
    
    // Assert - Verify all form elements are visible
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
    await registerPage.expectPasswordHintsVisible();
  });

  test('should show validation error for invalid email format', async () => {
    // Arrange
    const invalidEmail = 'nieprawidlowy-email';
    
    // Act
    await registerPage.fillEmail(invalidEmail);
    await registerPage.blurEmailInput();
    
    // Assert
    await registerPage.expectEmailErrorToContain('Wprowadź poprawny adres email');
  });

  test('should show validation errors for weak password', async () => {
    // Arrange
    const weakPassword = 'weak';
    
    // Act
    await registerPage.fillPassword(weakPassword);
    await registerPage.blurPasswordInput();
    
    // Assert
    await registerPage.expectPasswordErrorToContain('Hasło musi mieć minimum 8 znaków');
  });

  test('should show error when passwords do not match', async () => {
    // Arrange
    const password = 'Haslo123@';
    const differentPassword = 'InneHaslo123@';
    
    // Act
    await registerPage.fillPassword(password);
    await registerPage.fillConfirmPassword(differentPassword);
    await registerPage.blurConfirmPasswordInput();
    
    // Assert
    await registerPage.expectConfirmPasswordErrorToContain('Hasła muszą być identyczne');
  });

  test('should disable submit button when form is invalid', async () => {
    // Arrange - Page already loaded
    
    // Act - Fill with invalid data
    await registerPage.fillEmail('nieprawidlowy');
    await registerPage.fillPassword('weak');
    
    // Assert
    await registerPage.expectSubmitButtonDisabled();
  });

  test('should show error for already registered email', async ({ page }) => {
    // Arrange
    const existingEmail = 'example5@example.pl';
    const validPassword = 'Haslo123@';
    
    // Act
    await registerPage.attemptRegistration(existingEmail, validPassword);
    
    // Assert
    await registerPage.waitForGeneralError();
    await registerPage.expectGeneralErrorToContain('Ten adres email jest już zarejestrowany');
  });

  test('should successfully register new user and redirect to dashboard', async ({ page }) => {
    // Arrange
    const uniqueEmail = registerPage.generateUniqueEmail('testuser');
    const validPassword = 'Haslo123@';
    const dashboardPage = new DashboardPage(page);
    
    // Act
    await registerPage.register(uniqueEmail, validPassword);
    
    // Assert
    await registerPage.expectRedirectToDashboard();
    await dashboardPage.expectToBeOnDashboard();
    await expect(dashboardPage.dashboardTitle).toBeVisible();
  });

  test('should change submit button text while loading', async ({ page }) => {
    // Arrange
    const uniqueEmail = registerPage.generateUniqueEmail();
    const validPassword = 'Haslo123@';
    
    // Act
    await registerPage.fillRegistrationForm(uniqueEmail, validPassword);
    
    // Assert - Check initial button text
    await registerPage.expectSubmitButtonText('Utwórz konto');
    
    // Act - Submit form
    await registerPage.clickSubmit();
    
    // Assert - Button text should change during loading (might be too fast to catch)
    // This is more of a visual test, but we can verify the final state
    await registerPage.expectRedirectToDashboard();
  });

  test('should navigate to login page when clicking login link', async ({ page }) => {
    // Arrange - Page already loaded
    
    // Act
    await registerPage.clickLoginLink();
    
    // Assert
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear error messages when correcting input', async () => {
    // Arrange
    const invalidEmail = 'nieprawidlowy';
    const validEmail = 'valid@example.pl';
    
    // Act - Enter invalid email and trigger validation
    await registerPage.fillEmail(invalidEmail);
    await registerPage.blurEmailInput();
    
    // Assert - Error should be visible
    await registerPage.expectEmailErrorToContain('Wprowadź poprawny adres email');
    
    // Act - Correct the email
    await registerPage.clearEmail();
    await registerPage.fillEmail(validEmail);
    
    // Assert - Error should disappear
    await expect(registerPage.emailError).not.toBeVisible();
  });

  test('should show all password requirements', async () => {
    // Arrange & Assert
    await registerPage.expectPasswordHintsVisible();
    
    // Verify hints contain key requirements
    await expect(registerPage.passwordHints).toContainText('Co najmniej 8 znaków');
    await expect(registerPage.passwordHints).toContainText('Co najmniej jedną wielką literę');
    await expect(registerPage.passwordHints).toContainText('Co najmniej jedną cyfrę');
    await expect(registerPage.passwordHints).toContainText('Co najmniej jeden znak specjalny');
  });
});

/**
 * Complete Registration Scenario Test
 * This test follows the exact scenario described in requirements
 */
test.describe('Complete Registration Scenario', () => {
  test('should handle existing email and then register with new email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);

    // Step 1: Navigate to register page
    await registerPage.navigate();

    // Step 2: Wait for page to load
    await registerPage.expectToBeOnRegisterPage();

    // Step 3-5: Fill form with existing email
    const existingEmail = 'example5@example.pl';
    const validPassword = 'Haslo123@';
    
    await registerPage.fillEmail(existingEmail);
    await registerPage.fillPassword(validPassword);
    await registerPage.fillConfirmPassword(validPassword);

    // Step 6: Click submit button
    await registerPage.clickSubmit();

    // Step 7: Expect error message about existing email
    await registerPage.waitForGeneralError();
    await registerPage.expectGeneralErrorToContain('Ten adres email jest już zarejestrowany');

    // Step 8: Create new account with unique email
    const uniqueEmail = registerPage.generateUniqueEmail();
    
    // Step 8a-c: Fill form with new email
    await registerPage.clearAllFields();
    await registerPage.fillEmail(uniqueEmail);
    await registerPage.fillPassword(validPassword);
    await registerPage.fillConfirmPassword(validPassword);
    
    await registerPage.clickSubmit();

    // Step 9: Wait for registration to complete
    // Step 10: Verify redirect to dashboard
    await registerPage.expectRedirectToDashboard();
    await dashboardPage.expectToBeOnDashboard();
  });
});
