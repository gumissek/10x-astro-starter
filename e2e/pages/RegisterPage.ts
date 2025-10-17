import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * RegisterPage - Page Object Model for the registration page
 * Handles all interactions with the registration form
 */
export class RegisterPage extends BasePage {
  // Page URL
  readonly path = '/register';

  // Locators - using data-testid for resilient selectors
  readonly pageContainer: Locator;
  readonly formTitle: Locator;
  readonly formDescription: Locator;
  readonly registerForm: Locator;
  
  // Email field
  readonly emailField: Locator;
  readonly emailInput: Locator;
  readonly emailError: Locator;
  
  // Password field
  readonly passwordField: Locator;
  readonly passwordInput: Locator;
  readonly passwordError: Locator;
  readonly passwordHints: Locator;
  
  // Confirm password field
  readonly confirmPasswordField: Locator;
  readonly confirmPasswordInput: Locator;
  readonly confirmPasswordError: Locator;
  
  // Actions
  readonly generalErrorMessage: Locator;
  readonly submitButton: Locator;
  readonly loginLinkSection: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageContainer = page.getByTestId('register-form-container');
    this.formTitle = page.getByTestId('register-form-title');
    this.formDescription = page.getByTestId('register-form-description');
    this.registerForm = page.getByTestId('register-form');
    
    // Email field locators
    this.emailField = page.getByTestId('register-email-field');
    this.emailInput = page.getByTestId('register-email-input');
    this.emailError = page.getByTestId('register-email-error');
    
    // Password field locators
    this.passwordField = page.getByTestId('register-password-field');
    this.passwordInput = page.getByTestId('register-password-input');
    this.passwordError = page.getByTestId('register-password-error');
    this.passwordHints = page.getByTestId('register-password-hints');
    
    // Confirm password field locators
    this.confirmPasswordField = page.getByTestId('register-confirm-password-field');
    this.confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    this.confirmPasswordError = page.getByTestId('register-confirm-password-error');
    
    // Action locators
    this.generalErrorMessage = page.getByTestId('register-error-message');
    this.submitButton = page.getByTestId('register-submit-button');
    this.loginLinkSection = page.getByTestId('register-login-link-section');
    this.loginLink = page.getByTestId('register-login-link');
  }

  /**
   * Navigate to the register page
   */
  async navigate(): Promise<void> {
    await this.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.pageContainer.waitFor({ state: 'visible' });
    await this.waitForLoadState('networkidle');
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
   * Fill the confirm password field
   * @param password - Password to fill
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Fill all registration fields
   * @param email - Email address
   * @param password - Password
   * @param confirmPassword - Confirm password (defaults to password if not provided)
   */
  async fillRegistrationForm(
    email: string, 
    password: string, 
    confirmPassword?: string
  ): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword || password);
  }

  /**
   * Clear the email field
   */
  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  /**
   * Clear the password field
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  /**
   * Clear the confirm password field
   */
  async clearConfirmPassword(): Promise<void> {
    await this.confirmPasswordInput.clear();
  }

  /**
   * Clear all form fields
   */
  async clearAllFields(): Promise<void> {
    await this.clearEmail();
    await this.clearPassword();
    await this.clearConfirmPassword();
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Submit the registration form
   * @param email - Email address
   * @param password - Password
   * @param confirmPassword - Confirm password (defaults to password if not provided)
   */
  async submitRegistration(
    email: string, 
    password: string, 
    confirmPassword?: string
  ): Promise<void> {
    await this.fillRegistrationForm(email, password, confirmPassword);
    await this.clickSubmit();
  }

  /**
   * Perform complete registration flow and wait for navigation to dashboard
   * @param email - Email address
   * @param password - Password
   * @param confirmPassword - Confirm password (defaults to password if not provided)
   */
  async register(
    email: string, 
    password: string, 
    confirmPassword?: string
  ): Promise<void> {
    await this.submitRegistration(email, password, confirmPassword);
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  /**
   * Attempt registration and expect it to fail (for testing error messages)
   * @param email - Email address
   * @param password - Password
   * @param confirmPassword - Confirm password (defaults to password if not provided)
   */
  async attemptRegistration(
    email: string, 
    password: string, 
    confirmPassword?: string
  ): Promise<void> {
    await this.submitRegistration(email, password, confirmPassword);
    // Don't wait for navigation, stay on the same page
  }

  /**
   * Click the login link to navigate to login page
   */
  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Blur (unfocus) from email input
   */
  async blurEmailInput(): Promise<void> {
    await this.emailInput.blur();
  }

  /**
   * Blur (unfocus) from password input
   */
  async blurPasswordInput(): Promise<void> {
    await this.passwordInput.blur();
  }

  /**
   * Blur (unfocus) from confirm password input
   */
  async blurConfirmPasswordInput(): Promise<void> {
    await this.confirmPasswordInput.blur();
  }

  /**
   * Generate a unique email address for testing
   * @param prefix - Optional prefix for the email (defaults to 'user')
   */
  generateUniqueEmail(prefix: string = 'user'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}@example.pl`;
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
    return await this.submitButton.textContent() || '';
  }

  /**
   * Check if email error is visible
   */
  async isEmailErrorVisible(): Promise<boolean> {
    return await this.emailError.isVisible();
  }

  /**
   * Check if password error is visible
   */
  async isPasswordErrorVisible(): Promise<boolean> {
    return await this.passwordError.isVisible();
  }

  /**
   * Check if confirm password error is visible
   */
  async isConfirmPasswordErrorVisible(): Promise<boolean> {
    return await this.confirmPasswordError.isVisible();
  }

  /**
   * Check if general error is visible
   */
  async isGeneralErrorVisible(): Promise<boolean> {
    try {
      return await this.generalErrorMessage.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Get email error message text
   */
  async getEmailErrorText(): Promise<string> {
    return await this.emailError.textContent() || '';
  }

  /**
   * Get password error message text
   */
  async getPasswordErrorText(): Promise<string> {
    return await this.passwordError.textContent() || '';
  }

  /**
   * Get confirm password error message text
   */
  async getConfirmPasswordErrorText(): Promise<string> {
    return await this.confirmPasswordError.textContent() || '';
  }

  /**
   * Get general error message text
   */
  async getGeneralErrorText(): Promise<string> {
    await this.generalErrorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.generalErrorMessage.textContent() || '';
  }

  /**
   * Wait for general error message to appear
   */
  async waitForGeneralError(): Promise<void> {
    await this.generalErrorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Wait for successful registration (redirect to dashboard)
   */
  async waitForSuccessfulRegistration(): Promise<void> {
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  // ============================================================================
  // ASSERTIONS - Verify page state
  // ============================================================================

  /**
   * Verify user is on the register page
   */
  async expectToBeOnRegisterPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/register/);
    await expect(this.pageContainer).toBeVisible();
  }

  /**
   * Verify form title is visible with correct text
   */
  async expectFormTitleVisible(): Promise<void> {
    await expect(this.formTitle).toBeVisible();
    await expect(this.formTitle).toHaveText('Utwórz konto');
  }

  /**
   * Verify email error contains specific text
   */
  async expectEmailErrorToContain(text: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toContainText(text);
  }

  /**
   * Verify password error contains specific text
   */
  async expectPasswordErrorToContain(text: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    await expect(this.passwordError).toContainText(text);
  }

  /**
   * Verify confirm password error contains specific text
   */
  async expectConfirmPasswordErrorToContain(text: string): Promise<void> {
    await expect(this.confirmPasswordError).toBeVisible();
    await expect(this.confirmPasswordError).toContainText(text);
  }

  /**
   * Verify general error contains specific text
   */
  async expectGeneralErrorToContain(text: string): Promise<void> {
    await expect(this.generalErrorMessage).toBeVisible();
    await expect(this.generalErrorMessage).toContainText(text);
  }

  /**
   * Verify general error has exact text
   */
  async expectGeneralErrorToHaveText(text: string): Promise<void> {
    await expect(this.generalErrorMessage).toBeVisible();
    await expect(this.generalErrorMessage).toHaveText(text);
  }

  /**
   * Verify submit button is disabled
   */
  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Verify submit button is enabled
   */
  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Verify submit button has specific text
   */
  async expectSubmitButtonText(text: string): Promise<void> {
    await expect(this.submitButton).toHaveText(text);
  }

  /**
   * Verify password hints are visible
   */
  async expectPasswordHintsVisible(): Promise<void> {
    await expect(this.passwordHints).toBeVisible();
  }

  /**
   * Verify user was redirected to dashboard after successful registration
   */
  async expectRedirectToDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  /**
   * Verify no errors are visible on the form
   */
  async expectNoErrors(): Promise<void> {
    await expect(this.emailError).not.toBeVisible();
    await expect(this.passwordError).not.toBeVisible();
    await expect(this.confirmPasswordError).not.toBeVisible();
    await expect(this.generalErrorMessage).not.toBeVisible();
  }
}
