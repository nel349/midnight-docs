import { test, expect } from '@playwright/test';

/**
 * Homepage Button Tests - Generic & Maintainable
 *
 * STRATEGY:
 * - Find buttons by CSS class (not text content)
 * - Works across components: Hero, PersonaTiles, Participate cards
 * - No hard-coded button text or counts
 * - Resilient to content changes
 *
 * CSS Classes used:
 * - Hero: .primaryBtn, .ghostBtn (from hero.module.css)
 * - PersonaTiles: CSS modules (generic Link selector)
 * - Participate: .participate-card (from index.mdx inline styles)
 */

test.describe('Homepage - Hero Buttons (Generic)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should find and click all hero primary buttons', async ({ page }) => {
		// Find all primary buttons by CSS class (using wildcard for CSS modules hash)
		const primaryBtns = page.locator('[class*="primaryBtn"]');
		const count = await primaryBtns.count();

		console.log(`Found ${count} primary button(s) in hero`);

		// FAIL if we find 0 buttons (prevents false positives)
		expect(count, 'Should find at least 1 primary button in hero section').toBeGreaterThan(0);

		// Test each primary button
		for (let i = 0; i < count; i++) {
			const btn = primaryBtns.nth(i);
			const href = await btn.getAttribute('href');
			const text = await btn.textContent();

			console.log(`  Testing primary button: "${text}" → ${href}`);

			if (href?.startsWith('http')) {
				// External link - test it
				const response = await page.goto(href, { timeout: 10000 });
				const status = response?.status() || 0;
				expect(status).toBeLessThan(400);
				console.log(`    ✅ External link OK (${status})`);
				await page.goto('/');
			} else if (href?.startsWith('/')) {
				// Internal link - test it
				await btn.click();
				await page.waitForLoadState('domcontentloaded');

				const bodyText = await page.textContent('body');
				expect(bodyText?.toLowerCase()).not.toContain('page not found');
				expect(bodyText?.toLowerCase()).not.toContain('404');

				console.log(`    ✅ Internal link OK`);
				await page.goto('/');
			}
		}
	});

	test('should find and click all hero ghost buttons', async ({ page }) => {
		// Find all ghost/secondary buttons by CSS class (using wildcard for CSS modules hash)
		const ghostBtns = page.locator('[class*="ghostBtn"]');
		const count = await ghostBtns.count();

		console.log(`Found ${count} ghost button(s) in hero`);

		// FAIL if we find 0 buttons (prevents false positives)
		expect(count, 'Should find at least 1 ghost button in hero section').toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const btn = ghostBtns.nth(i);
			const href = await btn.getAttribute('href');
			const text = await btn.textContent();

			console.log(`  Testing ghost button: "${text}" → ${href}`);

			if (href?.startsWith('http')) {
				// External link - test it
				const response = await page.goto(href, { timeout: 10000 });
				const status = response?.status() || 0;
				expect(status).toBeLessThan(400);
				console.log(`    ✅ External link OK (${status})`);
				await page.goto('/');
			} else if (href?.startsWith('/')) {
				// Internal link - test it
				await btn.click();
				await page.waitForLoadState('domcontentloaded');

				const bodyText = await page.textContent('body');
				expect(bodyText?.toLowerCase()).not.toContain('page not found');
				expect(bodyText?.toLowerCase()).not.toContain('404');

				console.log(`    ✅ Internal link OK`);
				await page.goto('/');
			}
		}
	});
});

test.describe('Homepage - Participate Cards (Generic)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should find and test all participate cards', async ({ page }) => {
		// Find all participate cards by CSS class
		const cards = page.locator('.participate-card');
		const count = await cards.count();

		console.log(`Found ${count} participate card(s)`);

		// Verify cards exist
		expect(count).toBeGreaterThan(0);

		// Test each card
		for (let i = 0; i < count; i++) {
			const card = cards.nth(i);
			const href = await card.getAttribute('href');
			const title = await card.locator('.participate-title').textContent();

			console.log(`  Card: "${title}" → ${href}`);

			// All participate cards should have href
			expect(href).toBeTruthy();

			if (href?.startsWith('/')) {
				// Internal link - navigate and verify
				await card.click();
				await page.waitForLoadState('domcontentloaded');

				// Verify not 404
				const bodyText = await page.textContent('body');
				expect(bodyText?.toLowerCase()).not.toContain('page not found');
				expect(bodyText?.toLowerCase()).not.toContain('404');

				console.log(`    ✅ Internal link OK`);

				await page.goto('/');
			} else if (href?.startsWith('http')) {
				// External link - verify it loads without error
				try {
					const response = await page.goto(href, { timeout: 10000 });
					const status = response?.status() || 0;

					// Check status code
					if (status >= 200 && status < 400) {
						console.log(`    ✅ External link OK (${status})`);
					} else {
						console.log(`    ⚠️  External link returned ${status}`);
						expect(status, `External link ${href} returned ${status}`).toBeLessThan(400);
					}
				} catch (error) {
					console.log(`    ❌ External link failed: ${error}`);
					throw new Error(`External link ${href} failed to load: ${error}`);
				}

				// Go back to homepage
				await page.goto('/');
			}
		}
	});
});

test.describe('Homepage - All Internal Links (Your Strategy)', () => {
	test('should click ALL internal links and verify no 404s', async ({ page }) => {
		await page.goto('/');

		// Strategy: Find ALL <a> tags with internal hrefs
		const allLinks = page.locator('a[href^="/"]');
		const count = await allLinks.count();

		console.log(`\n📊 Found ${count} internal links on homepage\n`);

		const results: Array<{ text: string; href: string; status: string }> = [];

		// Test all internal links (limit to 30 for reasonable test time)
		const limit = Math.min(count, 30);

		for (let i = 0; i < limit; i++) {
			const link = allLinks.nth(i);
			const href = await link.getAttribute('href');
			const text = (await link.textContent())?.trim().substring(0, 50) || '';

			// Skip fragments and empty hrefs
			if (!href || href === '/' || href === '#') continue;

			try {
				await link.click({ timeout: 5000 });
				await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

				// Check for 404
				const bodyText = await page.textContent('body');
				const is404 =
					bodyText?.toLowerCase().includes('404') ||
					bodyText?.toLowerCase().includes('page not found');

				results.push({
					text,
					href,
					status: is404 ? '❌ 404' : '✅ OK',
				});

				// Go back
				await page.goto('/');
			} catch (error) {
				results.push({
					text,
					href,
					status: `⚠️  Timeout/Error`,
				});
				await page.goto('/');
			}
		}

		// Log results
		console.log(`\n📋 Test Results (${results.length} links tested):\n`);
		results.forEach((r) => {
			console.log(`  ${r.status} ${r.text.padEnd(30)} → ${r.href}`);
		});

		// Assertions
		const broken = results.filter((r) => r.status.includes('404'));
		expect(broken, `Found ${broken.length} broken link(s)`).toHaveLength(0);

		const errors = results.filter((r) => r.status.includes('Error'));
		expect(errors.length, `${errors.length} link(s) timed out`).toBeLessThan(3); // Allow some timeouts
	});
});

test.describe('Homepage - Component Discovery', () => {
	test('should discover all clickable component types on homepage', async ({ page }) => {
		await page.goto('/');

		// Discover different types of clickable elements
		const discovery = {
			heroPrimary: await page.locator('[class*="primaryBtn"]').count(),
			heroGhost: await page.locator('[class*="ghostBtn"]').count(),
			participateCards: await page.locator('.participate-card').count(),
			navLinks: await page.locator('nav a').count(),
			allInternalLinks: await page.locator('a[href^="/"]').count(),
			allExternalLinks: await page.locator('a[href^="http"]').count(),
		};

		console.log('\n🔍 Component Discovery:');
		console.log(`  Hero Primary Buttons: ${discovery.heroPrimary}`);
		console.log(`  Hero Ghost Buttons: ${discovery.heroGhost}`);
		console.log(`  Participate Cards: ${discovery.participateCards}`);
		console.log(`  Navigation Links: ${discovery.navLinks}`);
		console.log(`  Total Internal Links: ${discovery.allInternalLinks}`);
		console.log(`  Total External Links: ${discovery.allExternalLinks}`);

		// Assertions - flexible, will adapt to content changes
		expect(discovery.heroPrimary).toBeGreaterThan(0);
		expect(discovery.heroGhost).toBeGreaterThan(0);
		expect(discovery.participateCards).toBeGreaterThan(0);
		expect(discovery.allInternalLinks).toBeGreaterThan(5);
	});
});
