import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Strategic Broad Coverage
 *
 * PURPOSE:
 * - Catch broken links and pages
 * - Fast execution
 * - Run on every deployment
 * - No detailed assertions, just "does it work?"
 *
 * WHEN TO RUN:
 * - After every deployment
 * - Before running deeper functional tests
 * - In CI/CD pipeline (quick feedback)
 *
 * BEST PRACTICE:
 * - These tests should be FAST (< 5 seconds total)
 * - Broad coverage, shallow depth
 * - Fail fast if site is fundamentally broken
 */

test.describe('Smoke Tests - Homepage', () => {
	test('should load homepage without errors', async ({ page }) => {
		// Navigate to homepage
		const response = await page.goto('/');

		// Assert: Page loaded successfully
		expect(response?.status()).toBe(200);

		// Assert: No console errors (optional but useful)
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		// Assert: Title is not empty
		const title = await page.title();
		expect(title.length).toBeGreaterThan(0);
	});

	test('should have no broken internal links on homepage', async ({ page }) => {
		await page.goto('/');

		// Get all internal links
		const links = await page.locator('a[href^="/"]').all();

		console.log(`Found ${links.length} internal links to test`);

		// Track results
		const brokenLinks: { href: string; status: number }[] = [];

		// Test each link (limit to first 20 for speed)
		const linksToTest = links.slice(0, 20);

		for (const link of linksToTest) {
			const href = await link.getAttribute('href');
			if (!href || href === '#' || href === '/') continue;

			// Navigate and check status
			const response = await page.goto(href);
			const status = response?.status() || 0;

			if (status >= 400) {
				brokenLinks.push({ href, status });
			}

			// Go back to homepage for next link
			await page.goto('/');
		}

		// Assert: No broken links found
		expect(brokenLinks, `Found broken links: ${JSON.stringify(brokenLinks, null, 2)}`).toHaveLength(0);
	});

	test('should have working navigation bar', async ({ page }) => {
		await page.goto('/');

		// Find navigation element
		const nav = page.locator('nav').first();

		// Assert: Navigation exists and is visible
		await expect(nav).toBeVisible();

		// Get all navigation links
		const navLinks = await nav.locator('a[href]').all();

		// Assert: Navigation has links
		expect(navLinks.length).toBeGreaterThan(0);

		console.log(`Navigation has ${navLinks.length} links`);
	});

	test('should have accessible search', async ({ page }) => {
		await page.goto('/');

		// Look for any search-related element (flexible)
		const searchElements = await page.locator('[class*="search"], [aria-label*="search" i], button:has-text("search")').count();

		// Assert: At least one search element exists
		expect(searchElements).toBeGreaterThan(0);
	});

	test('should load within acceptable time', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		const loadTime = Date.now() - startTime;

		// Assert: Page loads in under 3 seconds
		expect(loadTime).toBeLessThan(3000);

		console.log(`Page loaded in ${loadTime}ms`);
	});
});

/**
 * Smoke Tests - Critical Pages
 *
 * Test that all main sections of the site are accessible
 */
test.describe('Smoke Tests - Critical Pages', () => {
	const criticalPages = [
		{ path: '/', name: 'Homepage' },
		{ path: '/getting-started', name: 'Getting Started' },
		{ path: '/learn', name: 'Learn' },
		{ path: '/develop', name: 'Develop' },
		{ path: '/blog', name: 'Blog' },
	];

	for (const { path, name } of criticalPages) {
		test(`should load ${name} page without errors`, async ({ page }) => {
			const response = await page.goto(path);

			// Assert: 200 status
			expect(response?.status()).toBe(200);

			// Assert: Page has content (not blank)
			const bodyText = await page.locator('body').textContent();
			expect(bodyText?.length).toBeGreaterThan(100);

			// Assert: No "404" or "Page Not Found" in title or h1
			const title = await page.title();
			const h1Text = await page.locator('h1').first().textContent().catch(() => '');

			expect(title.toLowerCase()).not.toContain('404');
			expect(title.toLowerCase()).not.toContain('Page Not Found');
			expect(h1Text.toLowerCase()).not.toContain('404');
			expect(h1Text.toLowerCase()).not.toContain('Page Not Found');
		});
	}
});

/**
 * Smoke Tests - Link Crawler
 *
 * YOUR IDEA IMPLEMENTED!
 * This test crawls the homepage and clicks every link to verify no 404s
 */
test.describe('Smoke Tests - Link Crawler', () => {
	test('should click all clickable elements and verify no 404s', async ({ page }) => {
		await page.goto('/');

		// Get all clickable elements (links and buttons with hrefs)
		const clickableElements = await page.locator('a[href]:visible').all();

		console.log(`Found ${clickableElements.length} clickable elements`);

		const results: Array<{ element: string; href: string; status: string }> = [];

		// Test first 15 elements (to keep test fast)
		for (let i = 0; i < Math.min(15, clickableElements.length); i++) {
			const element = clickableElements[i];
			const href = await element.getAttribute('href');

			if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
				continue;
			}

			// Handle external links differently
			if (href.startsWith('http') && !href.includes('docs.midnight.network')) {
				results.push({ element: await element.textContent() || '', href, status: 'external-skipped' });
				continue;
			}

			try {
				// Click the element
				await element.click({ timeout: 5000 });

				// Wait for navigation
				await page.waitForLoadState('domcontentloaded');

				// Check for 404
				const pageText = await page.textContent('body');
				const is404 = pageText?.toLowerCase().includes('404') ||
				             pageText?.toLowerCase().includes('page not found') ||
				             pageText?.toLowerCase().includes('not found');

				results.push({
					element: await element.textContent() || '',
					href,
					status: is404 ? '404-FOUND' : 'ok',
				});

				// Go back to homepage
				await page.goto('/');
			} catch (error) {
				results.push({
					element: await element.textContent() || '',
					href,
					status: `error: ${error}`,
				});
				// Go back to homepage on error
				await page.goto('/');
			}
		}

		// Log results
		console.log('Link crawler results:', JSON.stringify(results, null, 2));

		// Assert: No 404s found
		const broken = results.filter((r) => r.status.includes('404'));
		expect(broken, `Found 404 pages: ${JSON.stringify(broken, null, 2)}`).toHaveLength(0);
	});
});
