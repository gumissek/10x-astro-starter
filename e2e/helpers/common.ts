import type { Page } from "@playwright/test";

/**
 * Helper function to wait for navigation
 */
export async function waitForNavigation(page: Page, url: string) {
  await page.waitForURL(url);
}

/**
 * Helper function to fill form field
 */
export async function fillFormField(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

/**
 * Helper function to click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.getByRole("button", { name: text }).click();
}
