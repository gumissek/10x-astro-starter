# Testing Environment Setup

## Overview
This project uses **Vitest** for unit and integration tests, and **Playwright** for end-to-end tests.

## Unit Tests (Vitest)

### Configuration
- Configuration file: `vitest.config.ts`
- Test setup file: `src/__tests__/setup.ts`
- Test files location: `src/**/*.{test,spec}.{ts,tsx}`

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests should follow these conventions:
- Use `describe` blocks to group related tests
- Follow Arrange-Act-Assert pattern
- Use `vi.fn()` for mocks and `vi.spyOn()` for spies
- Leverage `@testing-library/react` for component testing
- Use inline snapshots with `toMatchInlineSnapshot()`

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## E2E Tests (Playwright)

### Configuration
- Configuration file: `playwright.config.ts`
- Test files location: `e2e/**/*.spec.ts`
- Page Objects: `e2e/pages/`
- Helpers: `e2e/helpers/`
- Fixtures: `e2e/fixtures/`

### Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Generate tests with codegen
npm run test:e2e:codegen
```

### Writing Tests

Tests should follow the Page Object Model pattern:
- Create page objects in `e2e/pages/`
- Use custom fixtures from `e2e/fixtures/test.ts`
- Utilize helper functions from `e2e/helpers/`

Example:
```typescript
import { test, expect } from '../fixtures/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Best Practices

### Unit Tests (Vitest)
- Keep tests focused and isolated
- Mock external dependencies
- Use descriptive test names
- Test behavior, not implementation
- Aim for meaningful coverage, not 100%

### E2E Tests (Playwright)
- Use Page Object Model for maintainability
- Leverage locators for resilient element selection
- Implement proper waits (avoid hard-coded timeouts)
- Use browser contexts for test isolation
- Enable trace viewer for debugging (`trace: 'on-first-retry'`)

## CI/CD Integration

Both test suites are configured to run in CI environments:
- Vitest runs with standard configuration
- Playwright uses `retries: 2` and `workers: 1` in CI
- Coverage reports are generated automatically

## Debugging

### Vitest
- Use VS Code debugger with Vitest extension
- Run `npm run test:ui` for visual debugging
- Check coverage reports in `coverage/` directory

### Playwright
- Use `npm run test:e2e:debug` for step-by-step debugging
- View trace files in `test-results/` directory
- Check HTML reports in `playwright-report/` directory
- Use `npx playwright show-report` to view reports

## Dependencies

### Vitest
- `vitest` - Test framework
- `@vitest/ui` - UI mode
- `@vitest/coverage-v8` - Coverage provider
- `jsdom` - DOM environment
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation

### Playwright
- `@playwright/test` - Test framework
- Chromium browser (installed via `npx playwright install chromium`)
