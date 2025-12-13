import { test, expect } from '@playwright/test';
import pipelineUrls from '../../pipelines-urls.json';

/**
 * Smoke Tests - Site-Wide Critical Pages
 *
 * PURPOSE:
 * - Verify ALL critical pages across the entire site are accessible
 * - Fast execution (< 30 seconds total)
 * - Run on every deployment
 * - Fail fast if site is fundamentally broken
 *
 * STRATEGY:
 * - Test that pages load (200 status)
 * - Test that pages have content (not blank/404)
 * - NO detailed functionality testing (that's for page-specific tests)
 * - Uses pipelines-urls.json (the same URLs tested in CI/CD)
 *
 * WHEN TO RUN:
 * - Before running deeper functional tests
 * - In CI/CD pipeline (quick feedback)
 * - After every deployment
 *
 * WHAT THIS DOESN'T TEST:
 * - Specific buttons or features (see homepage/buttons.spec.ts)
 * - Forms or interactions (see functional tests)
 * - Detailed component behavior (see page-specific tests)
 */

test.describe('Smoke Tests - All Critical Pages', () => {
	/**
	 * Critical pages from pipelines-urls.json
	 * These are the same URLs tested in the CI/CD pipeline
	 */
	const criticalPages = pipelineUrls.paths.map((path) => ({
		path,
		name: path === '/' ? 'Homepage' : path,
	}));

	for (const { path, name } of criticalPages) {
		test(`should load ${name} without errors`, async ({ page }) => {
			// Act: Navigate to page
			const response = await page.goto(path, { timeout: 10000 });

			// Assert: HTTP 200 status
			expect(response?.status(), `${name} should return 200`).toBe(200);

			// Assert: Page has content (not blank)
			const bodyText = await page.locator('body').textContent();
			expect(bodyText?.length, `${name} should have content`).toBeGreaterThan(100);

			// Assert: No "404" or "Page Not Found" in page
			const title = await page.title();
			const h1Text = await page.locator('h1').first().textContent().catch(() => '');

			expect(title.toLowerCase()).not.toContain('404');
			expect(title.toLowerCase()).not.toContain('not found');
			expect(h1Text.toLowerCase()).not.toContain('404');
			expect(h1Text.toLowerCase()).not.toContain('not found');

			console.log(`✅ ${name} loaded successfully`);
		});
	}
});

/**
 * Smoke Tests - Basic Site Functionality
 *
 * Test core features that should work across the entire site
 */
test.describe('Smoke Tests - Core Site Features', () => {
	test('should have working navigation on homepage', async ({ page }) => {
		await page.goto('/');

		// Find navigation element
		const nav = page.locator('nav').first();

		// Assert: Navigation exists and is visible
		await expect(nav).toBeVisible();

		// Get all navigation links
		const navLinks = await nav.locator('a[href]').all();

		// Assert: Navigation has links
		expect(navLinks.length, 'Navigation should have links').toBeGreaterThan(0);

		console.log(`✅ Navigation has ${navLinks.length} links`);
	});

	test('should have accessible search functionality', async ({ page }) => {
		await page.goto('/');

		// Look for any search-related element (flexible for different implementations)
		const searchElements = await page.locator('[class*="search"], [aria-label*="search" i], button:has-text("search")').count();

		// Assert: At least one search element exists
		expect(searchElements, 'Search functionality should be present').toBeGreaterThan(0);

		console.log(`✅ Found ${searchElements} search element(s)`);
	});

	test('should load homepage within acceptable time', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		const loadTime = Date.now() - startTime;

		// Assert: Page loads in under 5 seconds
		expect(loadTime, 'Homepage should load in under 5 seconds').toBeLessThan(5000);

		console.log(`✅ Homepage loaded in ${loadTime}ms`);
	});
});

/**
 * Smoke Tests - Quick Link Validation
 *
 * Spot-check that internal links are working
 * (Deep link testing is in homepage/buttons.spec.ts)
 */
test.describe('Smoke Tests - Link Validation', () => {
	test('should have no broken navigation links', async ({ page }) => {
		await page.goto('/');

		// Get navigation links only (not all links on page)
		const nav = page.locator('nav').first();
		const navLinks = await nav.locator('a[href^="/"]').all();

		console.log(`Testing ${navLinks.length} navigation links`);

		const brokenLinks: { href: string; status: number }[] = [];

		// Test each navigation link
		for (const link of navLinks) {
			const href = await link.getAttribute('href');
			if (!href || href === '#' || href === '/') continue;

			// Navigate and check status
			const response = await page.goto(href, { timeout: 5000 });
			const status = response?.status() || 0;

			if (status >= 400) {
				brokenLinks.push({ href, status });
			}

			console.log(`  ${href} → ${status}`);
		}

		// Assert: No broken navigation links
		expect(brokenLinks, `Found broken navigation links: ${JSON.stringify(brokenLinks, null, 2)}`).toHaveLength(0);
	});
});
