import { Page, Locator, expect } from '@playwright/test';

/**
 * Navigation Component - Reusable navigation header
 *
 * BEST PRACTICE: Component Pattern
 * - Components represent reusable UI elements
 * - Used across multiple pages
 * - Initialized with page object in constructor
 * - Contains locators and methods for the component only
 */
export class Navigation {
	readonly page: Page;

	// Navigation locators
	readonly navBar: Locator;
	readonly homeLink: Locator;
	readonly gettingStartedLink: Locator;
	readonly learnLink: Locator;
	readonly developLink: Locator;
	readonly validateLink: Locator;
	readonly operateLink: Locator;
	readonly academyLink: Locator;
	readonly blogLink: Locator;

	// Utility links
	readonly searchButton: Locator;
	readonly githubLink: Locator;
	readonly discordLink: Locator;

	// Mobile menu
	readonly mobileMenuButton: Locator;
	readonly mobileMenu: Locator;

	constructor(page: Page) {
		this.page = page;

		// Navigation bar
		this.navBar = page.locator('nav').first();

		// Main navigation links - adjust selectors based on actual DOM
		this.homeLink = page.getByRole('link', { name: /^home$/i });
		this.gettingStartedLink = page.getByRole('link', { name: /getting started/i });
		this.learnLink = page.getByRole('link', { name: /^learn$/i });
		this.developLink = page.getByRole('link', { name: /^develop$/i });
		this.validateLink = page.getByRole('link', { name: /validate/i });
		this.operateLink = page.getByRole('link', { name: /operate/i });
		this.academyLink = page.getByRole('link', { name: /academy/i });
		this.blogLink = page.getByRole('link', { name: /blog/i });

		// Utility
		this.searchButton = page.getByRole('button', { name: /search/i });
		this.githubLink = page.getByRole('link', { name: /github/i });

		// Mobile
		this.mobileMenuButton = page.getByRole('button', { name: /menu/i });
		this.mobileMenu = page.locator('[class*="mobile-menu"]');
	}

	/**
	 * Navigate to Getting Started section
	 */
	async navigateToGettingStarted() {
		await this.gettingStartedLink.click();
		await this.page.waitForURL(/\/getting-started/);
	}

	/**
	 * Navigate to Learn section
	 */
	async navigateToLearn() {
		await this.learnLink.click();
		await this.page.waitForURL(/\/learn/);
	}

	/**
	 * Navigate to Develop section
	 */
	async navigateToDevelop() {
		await this.developLink.click();
		await this.page.waitForURL(/\/develop/);
	}

	/**
	 * Navigate to Validate section
	 */
	async navigateToValidate() {
		await this.validateLink.click();
		await this.page.waitForURL(/\/validate/);
	}

	/**
	 * Navigate to Operate section
	 */
	async navigateToOperate() {
		await this.operateLink.click();
		await this.page.waitForURL(/\/operate/);
	}

	/**
	 * Navigate to Academy
	 */
	async navigateToAcademy() {
		await this.academyLink.click();
		await this.page.waitForURL(/\/academy/);
	}

	/**
	 * Navigate to Blog
	 */
	async navigateToBlog() {
		await this.blogLink.click();
		await this.page.waitForURL(/\/blog/);
	}

	/**
	 * Open search modal
	 */
	async openSearch() {
		await this.searchButton.click();
	}

	/**
	 * Navigate to GitHub
	 */
	async openGitHub() {
		await this.githubLink.click();
	}

	/**
	 * Verify navigation bar is visible
	 */
	async verifyNavigationVisible() {
		await expect(this.navBar).toBeVisible();
	}

	/**
	 * Open mobile menu (for mobile viewports)
	 */
	async openMobileMenu() {
		await this.mobileMenuButton.click();
		await expect(this.mobileMenu).toBeVisible();
	}

	/**
	 * Verify all main navigation links are present
	 */
	async verifyAllLinksPresent() {
		await expect(this.gettingStartedLink).toBeVisible();
		await expect(this.learnLink).toBeVisible();
		await expect(this.developLink).toBeVisible();
	}
}
