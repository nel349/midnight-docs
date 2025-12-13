# Playwright Test Automation Guide - SDET Best Practices

## Table of Contents
1. [Project Structure](#project-structure)
2. [Best Practices](#best-practices)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Page Object Model](#page-object-model)
6. [Custom Fixtures](#custom-fixtures)
7. [Test Patterns](#test-patterns)
8. [CI/CD Integration](#cicd-integration)
9. [Debugging](#debugging)
10. [Common Pitfalls](#common-pitfalls)

---

## Project Structure

```
packages/tests/
├── e2e/                          # End-to-end functional tests
│   └── homepage.spec.ts          # Homepage test suite
├── page-objects/                 # Page Object Models
│   ├── BasePage.ts               # Base class for all pages
│   ├── HomePage.ts               # Homepage page object
│   └── components/               # Reusable components
│       └── Navigation.ts         # Navigation component
├── fixtures/                     # Custom Playwright fixtures
│   └── pageFixtures.ts           # Page object fixtures
├── helpers/                      # Test utilities
│   └── testHelpers.ts            # Common helper functions
├── utils/                        # Additional utilities
├── playwright.config.ts          # Playwright configuration
├── visual-regression.test.ts     # Visual regression tests
└── TESTING_GUIDE.md             # This file
```

---

## Best Practices

### 1. **Test Independence**
✅ Each test should run independently
✅ No shared state between tests
✅ Use `test.beforeEach()` for setup

```typescript
// ❌ BAD - Tests depend on each other
test('login', async () => {
  // login logic
});

test('view profile', async () => {
  // assumes user is already logged in from previous test
});

// ✅ GOOD - Each test is independent
test('should view profile after login', async ({ page }) => {
  // login
  // then view profile
});
```

### 2. **Clear Test Names**
Use descriptive names that explain WHAT and WHY

```typescript
// ❌ BAD
test('test1', async () => {});
test('homepage', async () => {});

// ✅ GOOD
test('should display hero section when homepage loads', async () => {});
test('should navigate to Learn section when link clicked', async () => {});
```

### 3. **Arrange-Act-Assert Pattern**

```typescript
test('should search for documentation', async ({ page }) => {
  // Arrange: Setup test data and page state
  const homePage = new HomePage(page);
  await homePage.open();

  // Act: Perform the action being tested
  await homePage.openSearch();
  await homePage.fillInput(searchInput, 'compact');

  // Assert: Verify expected outcome
  await expect(searchResults).toBeVisible();
});
```

### 4. **Use Page Object Model**
Never interact with elements directly in tests

```typescript
// ❌ BAD - Locators in test file
test('click button', async ({ page }) => {
  await page.locator('button.submit').click();
});

// ✅ GOOD - Use Page Objects
test('submit form', async ({ page }) => {
  const formPage = new FormPage(page);
  await formPage.clickSubmit();
});
```

### 5. **Stable Locators**
Priority order:
1. `data-testid` attributes (most stable)
2. `getByRole()` - semantic selectors
3. `getByText()` - text content
4. CSS selectors (least stable, avoid if possible)

```typescript
// ✅ BEST - Test ID
page.getByTestId('submit-button')

// ✅ GOOD - Semantic
page.getByRole('button', { name: 'Submit' })

// ⚠️  OK - Text
page.getByText('Submit')

// ❌ AVOID - CSS selectors
page.locator('.btn.btn-primary.submit')
```

### 6. **Avoid Hard Waits**

```typescript
// ❌ BAD
await page.waitForTimeout(5000);

// ✅ GOOD - Wait for specific condition
await page.waitForLoadState('networkidle');
await page.locator('#results').waitFor({ state: 'visible' });
await expect(page.locator('#results')).toBeVisible();
```

---

## Running Tests

### Run All Tests
```bash
# All tests, all browsers
npx playwright test

# Specific browser
npx playwright test --project=chromium

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Run Specific Tests
```bash
# Single file
npx playwright test homepage.spec.ts

# Tests matching pattern
npx playwright test -g "navigation"

# Specific line
npx playwright test homepage.spec.ts:25
```

### Run with Environment Variables
```bash
# Test against localhost
BASE_URL=http://localhost:3000 npx playwright test

# Test against staging
BASE_URL=https://staging.docs.midnight.network npx playwright test

# Test against production
BASE_URL=https://docs.midnight.network npx playwright test
```

### View Test Report
```bash
# Open HTML report
npx playwright show-report

# Generate and open
npx playwright test --reporter=html && npx playwright show-report
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

test.describe('Feature Name', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.open();
  });

  test('should do something', async () => {
    // Arrange
    // (done in beforeEach)

    // Act
    await homePage.clickButton();

    // Assert
    await expect(homePage.result).toBeVisible();
  });
});
```

### Using Custom Fixtures

```typescript
import { test, expect } from '../fixtures/pageFixtures';

// No manual initialization needed!
test('should load homepage', async ({ homePage }) => {
  await homePage.open();
  await homePage.verifyPageLoaded();
});
```

---

## Page Object Model

### Creating a Page Object

```typescript
// page-objects/MyPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  // Locators as properties
  readonly submitButton: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.emailInput = page.getByLabel('Email');
  }

  // Methods represent user actions
  async fillEmail(email: string) {
    await this.fillInput(this.emailInput, email);
  }

  async submit() {
    await this.clickElement(this.submitButton);
  }

  // Methods for verifications
  async verifyEmailError() {
    const errorMsg = this.page.getByText('Invalid email');
    await this.verifyElementVisible(errorMsg);
  }
}
```

### Using the Page Object

```typescript
test('should validate email', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto('/form');
  await myPage.fillEmail('invalid');
  await myPage.submit();
  await myPage.verifyEmailError();
});
```

---

## Custom Fixtures

Fixtures eliminate repetitive setup code:

```typescript
// fixtures/myFixtures.ts
import { test as base } from '@playwright/test';
import { MyPage } from '../page-objects/MyPage';

type MyFixtures = {
  myPage: MyPage;
};

export const test = base.extend<MyFixtures>({
  myPage: async ({ page }, use) => {
    const myPage = new MyPage(page);
    await myPage.goto('/form');
    await use(myPage);
  },
});

// Usage in tests
import { test } from '../fixtures/myFixtures';

test('my test', async ({ myPage }) => {
  // myPage is already initialized and on /form!
  await myPage.fillEmail('test@example.com');
});
```

---

## Test Patterns

### Testing Navigation

```typescript
test('should navigate to docs', async ({ page, navigation }) => {
  await page.goto('/');
  await navigation.navigateToDocs();
  await expect(page).toHaveURL(/\/docs/);
});
```

### Testing Forms

```typescript
test('should submit contact form', async ({ page }) => {
  const contactPage = new ContactPage(page);
  await contactPage.goto('/contact');
  await contactPage.fillName('John Doe');
  await contactPage.fillEmail('john@example.com');
  await contactPage.fillMessage('Hello!');
  await contactPage.submit();
  await contactPage.verifySuccessMessage();
});
```

### Testing Search

```typescript
test('should search and display results', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.goto('/');
  await searchPage.search('playwright');
  await searchPage.verifyResultsDisplayed();
  const resultCount = await searchPage.getResultCount();
  expect(resultCount).toBeGreaterThan(0);
});
```

### Testing Mobile Responsiveness

```typescript
test('should display mobile menu on small screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const homePage = new HomePage(page);
  await homePage.open();
  await expect(homePage.mobileMenuButton).toBeVisible();
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Debugging

### Debug Mode
```bash
# Opens Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test homepage.spec.ts --debug
```

### Pause Execution
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens Playwright Inspector
});
```

### Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Video Recording
Already configured in `playwright.config.ts`:
- Videos saved on failure
- Located in `test-results/`

### Traces
```bash
# View trace file
npx playwright show-trace test-results/trace.zip
```

---

## Common Pitfalls

### ❌ Flaky Tests
**Problem:** Tests pass/fail randomly

**Solutions:**
- Don't use `waitForTimeout()`
- Wait for specific conditions
- Ensure test independence
- Use stable locators

### ❌ Slow Tests
**Problem:** Tests take too long

**Solutions:**
- Run tests in parallel
- Use `networkidle` only when necessary
- Optimize page loads
- Mock external APIs when possible

### ❌ Hard-to-Maintain Tests
**Problem:** Changes break many tests

**Solutions:**
- Use Page Object Model
- Avoid CSS selectors
- Use `data-testid` attributes
- Keep tests simple and focused

---

## Learning Resources

1. **Official Docs:** https://playwright.dev
2. **Best Practices:** https://playwright.dev/docs/best-practices
3. **API Reference:** https://playwright.dev/docs/api/class-playwright

---

## Next Steps

1. ✅ Run existing tests
2. ✅ Create your first page object
3. ✅ Write your first test
4. ✅ Add custom fixtures
5. ✅ Set up CI/CD
6. ✅ Explore advanced patterns

Happy Testing! 🎭
