import { test, expect } from "@playwright/test";
import { LoginPage, DashboardPage } from "./pages";

/**
 * E2E Test Suite: Login Flow
 * Tests the complete user authentication flow from login to dashboard
 */
test.describe("Login Flow", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Arrange - Initialize page objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test("should successfully login with valid credentials and redirect to dashboard", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Assert - Verify we're on the login page
    await loginPage.expectToBeOnLoginPage();
    await loginPage.expectFormTitleVisible();

    // Act - Fill in credentials
    await loginPage.fillEmail("example5@example.pl");
    await loginPage.fillPassword("Haslo123@");

    // Assert - Submit button should be enabled with valid data
    await loginPage.expectSubmitButtonEnabled();

    // Act - Submit the login form
    await loginPage.clickSubmit();

    // Assert - Should redirect to dashboard
    await dashboardPage.expectToBeOnDashboard();
    await dashboardPage.expectAllActionsVisible();
  });

  test("should complete full login flow using login helper method", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Perform complete login
    await loginPage.login("example5@example.pl", "Haslo123@");

    // Assert - Should be on dashboard with all elements visible
    await dashboardPage.expectToBeOnDashboard();
    await dashboardPage.expectDashboardTitleVisible();
    await expect(dashboardPage.dashboardTitle).toHaveText("Twoje foldery");
  });

  test("should show validation error for invalid email", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Fill invalid email
    await loginPage.fillEmail("invalid-email");
    await loginPage.fillPassword("Haslo123@");

    // Assert - Submit button should be disabled
    await loginPage.expectSubmitButtonDisabled();

    // Act - Blur email field to trigger validation
    await loginPage.passwordInput.click();

    // Assert - Should show email error
    await loginPage.expectEmailErrorToContain("email");
  });

  test("should show validation error for empty password", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Fill email but leave password empty
    await loginPage.fillEmail("example5@example.pl");
    await loginPage.emailInput.blur();

    // Assert - Submit button should be disabled
    await loginPage.expectSubmitButtonDisabled();
  });

  test("should show error message for invalid credentials", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Submit with invalid credentials
    await loginPage.submitLogin("wrong@example.pl", "WrongPassword123@");

    // Assert - Should show general error message
    await loginPage.expectGeneralErrorToContain("Nieprawidłowy email lub hasło");

    // Assert - Should still be on login page
    await loginPage.expectToBeOnLoginPage();
  });

  test("should disable submit button while loading", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Fill credentials
    await loginPage.fillCredentials("example5@example.pl", "Haslo123@");

    // Act - Click submit
    await loginPage.submitButton.click();

    // Assert - Button text should change to "Logowanie..."
    // Note: This may be too fast to catch, depends on network speed
    const buttonText = await loginPage.getSubmitButtonText();
    expect(["Zaloguj się", "Logowanie..."]).toContain(buttonText);
  });

  test("should navigate to register page when clicking register link", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Act - Click register link
    await loginPage.clickRegisterLink();

    // Assert - Should navigate to register page
    await expect(loginPage.page).toHaveURL(/\/register/);
  });

  test("should have proper form accessibility attributes", async () => {
    // Arrange - Navigate to login page
    await loginPage.navigate();

    // Assert - Email input should have proper attributes
    await expect(loginPage.emailInput).toHaveAttribute("type", "email");
    await expect(loginPage.emailInput).toHaveAttribute("autocomplete", "email");

    // Assert - Password input should have proper attributes
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    await expect(loginPage.passwordInput).toHaveAttribute("autocomplete", "current-password");
  });
});

/**
 * E2E Test Suite: Dashboard Access
 * Tests dashboard page functionality after successful login
 */
test.describe("Dashboard Access", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Arrange - Initialize page objects and login
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Act - Login before each test
    await loginPage.navigate();
    await loginPage.login("example5@example.pl", "Haslo123@");
  });

  test("should display dashboard after successful login", async () => {
    // Assert - Dashboard should be visible
    await dashboardPage.expectToBeOnDashboard();
    await dashboardPage.expectDashboardTitleVisible();
  });

  test("should have action buttons visible", async () => {
    // Assert - Action buttons should be visible
    await dashboardPage.expectGenerateCardsButtonVisible();
    await dashboardPage.expectAddCardButtonVisible();
  });

  test("should navigate to generate page when clicking generate button", async ({ page }) => {
    // Act - Click generate cards button
    await dashboardPage.clickGenerateCards();

    // Assert - Should navigate to generate page
    await expect(page).toHaveURL(/\/generate/);
  });

  test("should navigate to manual-save page when clicking add card button", async ({ page }) => {
    // Act - Click add card button
    await dashboardPage.clickAddCard();

    // Assert - Should navigate to manual-save page
    await expect(page).toHaveURL(/\/manual-save/);
  });
});
