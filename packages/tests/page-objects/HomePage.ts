import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage - Page Object for Midnight Docs Homepage
 *
 * BEST PRACTICES:
 * 1. Locators use data-testid when available (most stable)
 * 2. Fall back to semantic selectors (getByRole, getByText)
 * 3. Avoid CSS selectors and XPath when possible
 * 4. Group related locators together
 * 5. Methods represent user actions
 */
export class HomePage extends BasePage {
	// Header/Navigation locators
	readonly logo: Locator;
	readonly searchButton: Locator;
	readonly githubLink: Locator;

	// Hero section locators
	readonly heroTitle: Locator;
	readonly heroDescription: Locator;

	// Quick links / Cards
	readonly gettingStartedCard: Locator;
	readonly learnCard: Locator;
	readonly developCard: Locator;

	// Footer locators
	readonly footer: Locator;

	constructor(page: Page) {
		super(page);

		// Initialize locators
		// Note: These are examples - adjust based on actual DOM structure
		this.logo = page.locator('a[href="/"]').first();
		this.searchButton = page.getByRole('button', { name: /search/i });

		// Hero section
		this.heroTitle = page.locator('h1').first();
		this.heroDescription = page.locator('p').first();

		// Navigation/Cards - adjust based on actual structure
		this.gettingStartedCard = page.getByRole('link', { name: /getting started/i });
		this.learnCard = page.getByRole('link', { name: /learn/i });
		this.developCard = page.getByRole('link', { name: /develop/i });

		this.footer = page.locator('footer');
	}

	/**
	 * Navigate to homepage
	 */
	async open() {
		await this.goto('/');
		await this.waitForPageLoad();
	}

	/**
	 * Verify homepage loaded correctly
	 */
	async verifyPageLoaded() {
		await this.verifyElementVisible(this.heroTitle);
		await this.verifyURL('/');
	}

	/**
	 * Click on Getting Started card
	 */
	async clickGettingStarted() {
		await this.clickElement(this.gettingStartedCard);
	}

	/**
	 * Click on Learn card
	 */
	async clickLearn() {
		await this.clickElement(this.learnCard);
	}

	/**
	 * Click on Develop card
	 */
	async clickDevelop() {
		await this.clickElement(this.developCard);
	}

	/**
	 * Open search
	 */
	async openSearch() {
		await this.clickElement(this.searchButton);
	}

	/**
	 * Verify hero section content
	 */
	async verifyHeroContent() {
		await this.verifyElementVisible(this.heroTitle);
		await this.verifyElementVisible(this.heroDescription);
	}

	/**
	 * Get hero title text
	 */
	async getHeroTitle(): Promise<string> {
		return await this.heroTitle.textContent() || '';
	}
}
