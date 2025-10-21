import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * LoginPage - Page Object Model for the login page
 * Handles all interactions with the login form
 */
export class LoginPage extends BasePage {
  // Page URL
  readonly path = "/login";

  // Locators - using data-testid for resilient selectors
  readonly pageContainer: Locator;
  readonly formContainer: Locator;
  readonly formTitle: Locator;
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly emailFieldContainer: Locator;
  readonly passwordFieldContainer: Locator;
  readonly emailErrorMessage: Locator;
  readonly passwordErrorMessage: Locator;
  readonly generalErrorMessage: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.pageContainer = page.getByTestId("login-page-container");
    this.formContainer = page.getByTestId("login-form-container");
    this.formTitle = page.getByTestId("login-form-title");
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.emailFieldContainer = page.getByTestId("email-field-container");
    this.passwordFieldContainer = page.getByTestId("password-field-container");
    this.emailErrorMessage = page.getByTestId("email-error-message");
    this.passwordErrorMessage = page.getByTestId("password-error-message");
    this.generalErrorMessage = page.getByTestId("login-error-message");
    this.submitButton = page.getByTestId("login-submit-button");
    this.registerLink = page.getByTestId("register-link");
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    await this.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.formContainer.waitFor({ state: "visible" });
    await this.waitForLoadState("networkidle");
  }

  /**
   * Fill the email field
   * @param email - Email address to fill
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill the password field
   * @param password - Password to fill
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill both email and password fields
   * @param email - Email address
   * @param password - Password
   */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Submit the login form with credentials
   * @param email - Email address
   * @param password - Password
   */
  async submitLogin(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickSubmit();
  }

  /**
   * Perform complete login flow and wait for navigation
   * @param email - Email address
   * @param password - Password
   */
  async login(email: string, password: string): Promise<void> {
    await this.submitLogin(email, password);
    await this.page.waitForURL("/dashboard", { timeout: 10000 });
  }

  /**
   * Click the register link
   */
  async clickRegisterLink(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Check if the submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if the submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /**
   * Get the submit button text
   */
  async getSubmitButtonText(): Promise<string> {
    return (await this.submitButton.textContent()) || "";
  }

  /**
   * Check if email error is visible
   */
  async isEmailErrorVisible(): Promise<boolean> {
    return await this.emailErrorMessage.isVisible();
  }

  /**
   * Check if password error is visible
   */
  async isPasswordErrorVisible(): Promise<boolean> {
    return await this.passwordErrorMessage.isVisible();
  }

  /**
   * Check if general error is visible
   */
  async isGeneralErrorVisible(): Promise<boolean> {
    return await this.generalErrorMessage.isVisible();
  }

  /**
   * Get email error message text
   */
  async getEmailErrorText(): Promise<string> {
    return (await this.emailErrorMessage.textContent()) || "";
  }

  /**
   * Get password error message text
   */
  async getPasswordErrorText(): Promise<string> {
    return (await this.passwordErrorMessage.textContent()) || "";
  }

  /**
   * Get general error message text
   */
  async getGeneralErrorText(): Promise<string> {
    return (await this.generalErrorMessage.textContent()) || "";
  }

  /**
   * Assertions - Verify page state
   */
  async expectToBeOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.formContainer).toBeVisible();
  }

  async expectFormTitleVisible(): Promise<void> {
    await expect(this.formTitle).toBeVisible();
    await expect(this.formTitle).toHaveText("Zaloguj się");
  }

  async expectEmailErrorToContain(text: string): Promise<void> {
    await expect(this.emailErrorMessage).toBeVisible();
    await expect(this.emailErrorMessage).toContainText(text);
  }

  async expectPasswordErrorToContain(text: string): Promise<void> {
    await expect(this.passwordErrorMessage).toBeVisible();
    await expect(this.passwordErrorMessage).toContainText(text);
  }

  async expectGeneralErrorToContain(text: string): Promise<void> {
    await expect(this.generalErrorMessage).toBeVisible();
    await expect(this.generalErrorMessage).toContainText(text);
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectSubmitButtonText(text: string): Promise<void> {
    await expect(this.submitButton).toHaveText(text);
  }
}
