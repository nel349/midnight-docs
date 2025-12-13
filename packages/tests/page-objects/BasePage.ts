import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Foundation for all Page Objects
 *
 * BEST PRACTICES:
 * 1. All page objects inherit from BasePage
 * 2. Common functionality lives here (navigation, waiting, etc.)
 * 3. Page-specific logic lives in child classes
 * 4. Locators are defined as properties, not methods
 * 5. Methods represent user actions or verifications
 */
export class BasePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Navigate to a specific path
	 * @param path - Relative path from base URL
	 */
	async goto(path: string = '') {
		await this.page.goto(path);
	}

	/**
	 * Wait for page to be fully loaded
	 */
	async waitForPageLoad() {
		await this.page.waitForLoadState('networkidle');
	}

	/**
	 * Get page title
	 */
	async getTitle(): Promise<string> {
		return await this.page.title();
	}

	/**
	 * Get current URL
	 */
	getURL(): string {
		return this.page.url();
	}

	/**
	 * Take a screenshot
	 * @param name - Screenshot filename
	 */
	async screenshot(name: string) {
		await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
	}

	/**
	 * Wait for element to be visible
	 * @param locator - Playwright locator
	 */
	async waitForElement(locator: Locator, timeout: number = 10000) {
		await locator.waitFor({ state: 'visible', timeout });
	}

	/**
	 * Scroll to element
	 * @param locator - Playwright locator
	 */
	async scrollToElement(locator: Locator) {
		await locator.scrollIntoViewIfNeeded();
	}

	/**
	 * Verify page URL contains expected path
	 * @param expectedPath - Expected URL path
	 */
	async verifyURL(expectedPath: string) {
		await expect(this.page).toHaveURL(new RegExp(expectedPath));
	}

	/**
	 * Verify element is visible
	 * @param locator - Playwright locator
	 */
	async verifyElementVisible(locator: Locator) {
		await expect(locator).toBeVisible();
	}

	/**
	 * Verify element contains text
	 * @param locator - Playwright locator
	 * @param text - Expected text
	 */
	async verifyElementText(locator: Locator, text: string) {
		await expect(locator).toContainText(text);
	}

	/**
	 * Click on element with retry logic
	 * @param locator - Playwright locator
	 */
	async clickElement(locator: Locator) {
		await locator.click();
	}

	/**
	 * Fill input field
	 * @param locator - Playwright locator
	 * @param text - Text to fill
	 */
	async fillInput(locator: Locator, text: string) {
		await locator.fill(text);
	}

	/**
	 * Press keyboard key
	 * @param key - Key to press
	 */
	async pressKey(key: string) {
		await this.page.keyboard.press(key);
	}

	/**
	 * Wait for specified time (use sparingly, prefer waitFor* methods)
	 * @param ms - Milliseconds to wait
	 */
	async wait(ms: number) {
		await this.page.waitForTimeout(ms);
	}
}
