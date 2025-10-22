import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Załaduj zmienne środowiskowe z pliku .env (tylko lokalnie, w CI są już ustawione)
if (!process.env.CI) {
  dotenv.config();
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Przekaż wszystkie zmienne środowiskowe potrzebne aplikacji
      // Vite/Astro potrzebuje tych zmiennych dostępnych w process.env
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_KEY: process.env.SUPABASE_KEY || "",
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
      AI_MODELNAME: process.env.AI_MODELNAME || "",
      NODE_ENV: process.env.NODE_ENV || "test",
      // Przekaż wszystkie inne zmienne środowiskowe
      ...process.env,
    },
  },
});
