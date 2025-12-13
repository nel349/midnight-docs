import { test as base } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { Navigation } from '../page-objects/components/Navigation';

/**
 * Custom Fixtures - Advanced Playwright Pattern
 *
 * BEST PRACTICES:
 * 1. ✅ Fixtures provide automatic setup/teardown
 * 2. ✅ Type-safe page objects
 * 3. ✅ Reusable across test files
 * 4. ✅ Lazy evaluation (only initialized when used)
 * 5. ✅ Composable (fixtures can depend on other fixtures)
 *
 * WHY USE FIXTURES?
 * - Eliminates repetitive setup code
 * - Automatic cleanup
 * - Better type safety
 * - Cleaner test code
 *
 * BEFORE (without fixtures):
 * ```
 * test('my test', async ({ page }) => {
 *   const homePage = new HomePage(page);
 *   await homePage.open();
 *   // ... test code
 * });
 * ```
 *
 * AFTER (with fixtures):
 * ```
 * test('my test', async ({ homePage }) => {
 *   // homePage is already initialized and ready!
 *   // ... test code
 * });
 * ```
 */

type PageFixtures = {
	homePage: HomePage;
	navigation: Navigation;
};

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend<PageFixtures>({
	/**
	 * HomePage fixture
	 * - Automatically initializes HomePage
	 * - Available in all tests as { homePage }
	 */
	homePage: async ({ page }, use) => {
		const homePage = new HomePage(page);
		await use(homePage);
	},

	/**
	 * Navigation fixture
	 * - Automatically initializes Navigation component
	 * - Available in all tests as { navigation }
	 */
	navigation: async ({ page }, use) => {
		const navigation = new Navigation(page);
		await use(navigation);
	},
});

export { expect } from '@playwright/test';
