import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage - Page Object Model for the dashboard page
 * Handles all interactions with the dashboard view
 */
export class DashboardPage extends BasePage {
  // Page URL
  readonly path = '/dashboard';

  // Locators - using data-testid for resilient selectors
  readonly dashboardContainer: Locator;
  readonly dashboardTitle: Locator;
  readonly generateCardsButton: Locator;
  readonly addCardButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.dashboardContainer = page.getByTestId('dashboard-container');
    this.dashboardTitle = page.getByTestId('dashboard-title');
    this.generateCardsButton = page.getByTestId('generate-cards-button');
    this.addCardButton = page.getByTestId('add-card-button');
  }

  /**
   * Navigate to the dashboard page
   */
  async navigate(): Promise<void> {
    await this.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.dashboardContainer.waitFor({ state: 'visible' });
    await this.waitForLoadState('networkidle');
  }

  /**
   * Click the "Generate Cards" button
   */
  async clickGenerateCards(): Promise<void> {
    await this.generateCardsButton.click();
  }

  /**
   * Click the "Add Card" button
   */
  async clickAddCard(): Promise<void> {
    await this.addCardButton.click();
  }

  /**
   * Get the dashboard title text
   */
  async getDashboardTitle(): Promise<string> {
    return await this.dashboardTitle.textContent() || '';
  }

  /**
   * Check if the dashboard is visible
   */
  async isDashboardVisible(): Promise<boolean> {
    return await this.dashboardContainer.isVisible();
  }

  /**
   * Assertions - Verify page state
   */
  async expectToBeOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.dashboardContainer).toBeVisible();
  }

  async expectDashboardTitleVisible(): Promise<void> {
    await expect(this.dashboardTitle).toBeVisible();
    await expect(this.dashboardTitle).toHaveText('Twoje foldery');
  }

  async expectGenerateCardsButtonVisible(): Promise<void> {
    await expect(this.generateCardsButton).toBeVisible();
  }

  async expectAddCardButtonVisible(): Promise<void> {
    await expect(this.addCardButton).toBeVisible();
  }

  async expectAllActionsVisible(): Promise<void> {
    await this.expectDashboardTitleVisible();
    await this.expectGenerateCardsButtonVisible();
    await this.expectAddCardButtonVisible();
  }
}
