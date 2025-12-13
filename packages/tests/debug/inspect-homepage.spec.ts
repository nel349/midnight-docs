import { test } from '@playwright/test';

/**
 * Debug Test - Find out what's actually on the homepage
 */

test('DEBUG: Inspect homepage HTML structure', async ({ page }) => {
	await page.goto('http://localhost:3000');

	// Wait for page to load
	await page.waitForLoadState('domcontentloaded');

	console.log('\n========================================');
	console.log('🔍 DEBUGGING HOMEPAGE STRUCTURE');
	console.log('========================================\n');

	// 1. Check if hero section exists
	const heroSection = page.locator('section').first();
	const heroExists = await heroSection.count();
	console.log(`Hero section exists: ${heroExists > 0 ? 'YES' : 'NO'}`);

	if (heroExists > 0) {
		const heroHTML = await heroSection.innerHTML();
		console.log('\n📄 Hero Section HTML (first 500 chars):');
		console.log(heroHTML.substring(0, 500));
	}

	// 2. Find ALL links in the first section
	console.log('\n🔗 ALL links in first section:');
	const linksInHero = await page.locator('section').first().locator('a').all();
	for (let i = 0; i < linksInHero.length; i++) {
		const link = linksInHero[i];
		const href = await link.getAttribute('href');
		const text = await link.textContent();
		const classes = await link.getAttribute('class');
		console.log(`  Link ${i + 1}:`);
		console.log(`    Text: ${text?.trim()}`);
		console.log(`    Href: ${href}`);
		console.log(`    Classes: ${classes}`);
	}

	// 3. Search for any element with "Btn" in class name
	console.log('\n🎨 Elements with "Btn" in class name:');
	const btnElements = await page.locator('[class*="Btn"]').all();
	console.log(`  Found ${btnElements.length} elements`);
	for (let i = 0; i < btnElements.length; i++) {
		const el = btnElements[i];
		const classes = await el.getAttribute('class');
		const text = await el.textContent();
		console.log(`    ${i + 1}. ${classes} → "${text?.trim().substring(0, 30)}"`);
	}

	// 4. Search for any element with "primary" in class name
	console.log('\n🎨 Elements with "primary" in class name:');
	const primaryElements = await page.locator('[class*="primary"]').all();
	console.log(`  Found ${primaryElements.length} elements`);
	for (let i = 0; i < Math.min(5, primaryElements.length); i++) {
		const el = primaryElements[i];
		const classes = await el.getAttribute('class');
		const text = await el.textContent();
		console.log(`    ${i + 1}. ${classes} → "${text?.trim().substring(0, 30)}"`);
	}

	// 5. Find buttons by role
	console.log('\n🔘 Buttons by role:');
	const buttons = await page.getByRole('button').all();
	console.log(`  Found ${buttons.length} buttons`);
	for (let i = 0; i < buttons.length; i++) {
		const btn = buttons[i];
		const text = await btn.textContent();
		const classes = await btn.getAttribute('class');
		console.log(`    ${i + 1}. "${text?.trim()}" → ${classes}`);
	}

	// 6. Find links by role
	console.log('\n🔗 First 10 links by role:');
	const roleLinks = await page.getByRole('link').all();
	console.log(`  Found ${roleLinks.length} links total`);
	for (let i = 0; i < Math.min(10, roleLinks.length); i++) {
		const link = roleLinks[i];
		const text = await link.textContent();
		const href = await link.getAttribute('href');
		console.log(`    ${i + 1}. "${text?.trim().substring(0, 40)}" → ${href}`);
	}

	// 7. Get all class names on the page
	console.log('\n🎨 All unique classes with "hero" in the name:');
	const allElements = await page.locator('[class*="hero"]').all();
	const uniqueClasses = new Set<string>();
	for (const el of allElements) {
		const classes = await el.getAttribute('class');
		if (classes) {
			classes.split(' ').forEach((cls) => {
				if (cls.toLowerCase().includes('hero')) {
					uniqueClasses.add(cls);
				}
			});
		}
	}
	uniqueClasses.forEach((cls) => console.log(`    - ${cls}`));

	console.log('\n========================================');
	console.log('✅ DEBUG COMPLETE');
	console.log('========================================\n');
});
