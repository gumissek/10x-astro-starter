import { type Page } from '@playwright/test';

/**
 * Base Page Object for common page operations
 */
export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.waitForLoadState(state);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
  }
}
