import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities
 *
 * BEST PRACTICES:
 * 1. ✅ DRY - Don't Repeat Yourself
 * 2. ✅ Reusable functions for common operations
 * 3. ✅ Clear function names
 * 4. ✅ Proper error handling
 * 5. ✅ JSDoc documentation
 */

/**
 * Wait for navigation to complete
 * @param page - Playwright page object
 * @param url - Expected URL pattern
 */
export async function waitForNavigation(page: Page, url: string | RegExp) {
	await page.waitForURL(url);
	await page.waitForLoadState('networkidle');
}

/**
 * Check if element is visible on page
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns boolean indicating visibility
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
	try {
		const element = page.locator(selector);
		await element.waitFor({ state: 'visible', timeout: 5000 });
		return true;
	} catch {
		return false;
	}
}

/**
 * Get all links on the page
 * @param page - Playwright page object
 * @returns Array of link URLs
 */
export async function getAllLinks(page: Page): Promise<string[]> {
	const links = await page.locator('a[href]').all();
	const urls: string[] = [];

	for (const link of links) {
		const href = await link.getAttribute('href');
		if (href) {
			urls.push(href);
		}
	}

	return urls;
}

/**
 * Verify all links on page are not broken (200 status)
 * @param page - Playwright page object
 */
export async function verifyNoB rokenLinks(page: Page) {
	const links = await getAllLinks(page);
	const baseURL = page.url();

	for (const link of links) {
		// Skip external links, mailto, tel, etc.
		if (link.startsWith('http') && !link.includes(new URL(baseURL).hostname)) {
			continue;
		}
		if (link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#')) {
			continue;
		}

		// Check internal links
		const response = await page.goto(link);
		expect(response?.status()).toBeLessThan(400);
	}
}

/**
 * Take screenshot with timestamp
 * @param page - Playwright page object
 * @param name - Screenshot name prefix
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	await page.screenshot({
		path: `test-results/${name}-${timestamp}.png`,
		fullPage: true,
	});
}

/**
 * Scroll to bottom of page
 * @param page - Playwright page object
 */
export async function scrollToBottom(page: Page) {
	await page.evaluate(() => {
		window.scrollTo(0, document.body.scrollHeight);
	});
}

/**
 * Scroll to top of page
 * @param page - Playwright page object
 */
export async function scrollToTop(page: Page) {
	await page.evaluate(() => {
		window.scrollTo(0, 0);
	});
}

/**
 * Get page load time
 * @param page - Playwright page object
 * @returns Load time in milliseconds
 */
export async function getPageLoadTime(page: Page): Promise<number> {
	const performanceData = await page.evaluate(() =>
		JSON.stringify(window.performance.timing)
	);
	const timing = JSON.parse(performanceData);
	return timing.loadEventEnd - timing.navigationStart;
}

/**
 * Check console errors during test
 * @param page - Playwright page object
 * @returns Array of console error messages
 */
export async function captureConsoleErrors(page: Page): Promise<string[]> {
	const errors: string[] = [];

	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			errors.push(msg.text());
		}
	});

	return errors;
}

/**
 * Wait for API response
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to wait for
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
	await page.waitForResponse((response) => {
		const url = response.url();
		if (typeof urlPattern === 'string') {
			return url.includes(urlPattern);
		}
		return urlPattern.test(url);
	});
}

/**
 * Verify no accessibility violations (basic check)
 * Note: For comprehensive a11y testing, use @axe-core/playwright
 * @param page - Playwright page object
 */
export async function verifyBasicAccessibility(page: Page) {
	// Check for basic accessibility requirements
	const hasMainLandmark = await isElementVisible(page, 'main');
	const hasNav = await isElementVisible(page, 'nav');

	expect(hasMainLandmark || hasNav).toBeTruthy();

	// Check all images have alt text
	const imagesWithoutAlt = await page.locator('img:not([alt])').count();
	expect(imagesWithoutAlt).toBe(0);
}

/**
 * Generate random test data
 */
export class TestDataGenerator {
	/**
	 * Generate random email
	 */
	static generateEmail(): string {
		const timestamp = Date.now();
		return `test.user.${timestamp}@example.com`;
	}

	/**
	 * Generate random string
	 * @param length - String length
	 */
	static generateString(length: number = 10): string {
		const chars = 'abcdefghijklmnopqrstuvwxyz';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	/**
	 * Generate random number within range
	 * @param min - Minimum value
	 * @param max - Maximum value
	 */
	static generateNumber(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
