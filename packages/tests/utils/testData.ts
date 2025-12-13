/**
 * Test Data Management
 *
 * BEST PRACTICES:
 * 1. ✅ Centralize test data
 * 2. ✅ Use constants for reusable values
 * 3. ✅ Environment-specific data
 * 4. ✅ Type-safe data structures
 * 5. ✅ Easy to maintain and update
 */

/**
 * URLs for different environments
 */
export const URLS = {
	local: 'http://localhost:3000',
	staging: 'https://staging.docs.midnight.network',
	production: 'https://docs.midnight.network',
};

/**
 * Common test paths
 */
export const PATHS = {
	home: '/',
	gettingStarted: '/getting-started',
	learn: '/learn',
	develop: '/develop',
	validate: '/validate',
	operate: '/operate',
	academy: '/academy',
	blog: '/blog',
	compact: '/compact',
};

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
	short: 5000,
	medium: 10000,
	long: 30000,
	navigation: 30000,
	api: 10000,
};

/**
 * Viewport sizes for responsive testing
 */
export const VIEWPORTS = {
	mobile: {
		small: { width: 375, height: 667 }, // iPhone SE
		medium: { width: 390, height: 844 }, // iPhone 13
		large: { width: 428, height: 926 }, // iPhone 13 Pro Max
	},
	tablet: {
		portrait: { width: 768, height: 1024 }, // iPad
		landscape: { width: 1024, height: 768 },
	},
	desktop: {
		small: { width: 1366, height: 768 },
		medium: { width: 1920, height: 1080 },
		large: { width: 2560, height: 1440 },
	},
};

/**
 * Test user data
 * Note: Never commit real credentials
 */
export const TEST_USERS = {
	valid: {
		email: 'test.user@example.com',
		password: 'TestPassword123!',
	},
	invalid: {
		email: 'invalid.email',
		password: '123',
	},
};

/**
 * Expected page titles
 */
export const PAGE_TITLES = {
	home: /Midnight/i,
	gettingStarted: /Getting Started/i,
	learn: /Learn/i,
	develop: /Develop/i,
};

/**
 * Navigation labels
 */
export const NAV_LABELS = {
	home: 'Home',
	gettingStarted: 'Getting Started',
	learn: 'Learn',
	develop: 'Develop',
	validate: 'Validate',
	operate: 'Operate',
	academy: 'Academy',
	blog: 'Blog',
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	required: 'This field is required',
	invalidEmail: 'Please enter a valid email address',
	invalidPassword: 'Password must be at least 8 characters',
	notFound: '404',
	serverError: '500',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
	formSubmitted: 'Form submitted successfully',
	saved: 'Changes saved',
};

/**
 * API endpoints (if testing API)
 */
export const API_ENDPOINTS = {
	search: '/api/search',
	docs: '/api/docs',
};

/**
 * Test data generator for dynamic data
 */
export class TestData {
	/**
	 * Generate unique email
	 */
	static generateEmail(): string {
		return `test.${Date.now()}@example.com`;
	}

	/**
	 * Generate random username
	 */
	static generateUsername(): string {
		return `user_${Date.now()}`;
	}

	/**
	 * Generate random string
	 */
	static generateString(length: number = 10): string {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		return Array.from({ length }, () =>
			chars.charAt(Math.floor(Math.random() * chars.length))
		).join('');
	}

	/**
	 * Get current environment URL
	 */
	static getBaseURL(): string {
		return process.env.BASE_URL || URLS.local;
	}
}

/**
 * Browser-specific data
 */
export const BROWSERS = {
	chromium: 'chromium',
	firefox: 'firefox',
	webkit: 'webkit',
	mobileChrome: 'mobile-chrome',
	mobileSafari: 'mobile-safari',
};

/**
 * Common search queries for testing
 */
export const SEARCH_QUERIES = {
	valid: ['compact', 'midnight', 'blockchain', 'tutorial'],
	invalid: ['xyzabc123', '!!!@@@###'],
	special: ['test@#$', 'test with spaces'],
};

/**
 * Form test data
 */
export const FORM_DATA = {
	contact: {
		name: 'John Doe',
		email: 'john.doe@example.com',
		message: 'This is a test message for automated testing.',
	},
	newsletter: {
		email: 'subscriber@example.com',
	},
};

/**
 * Accessibility test data
 */
export const A11Y_REQUIREMENTS = {
	minContrastRatio: 4.5,
	headingLevels: [1, 2, 3, 4, 5, 6],
	ariaRoles: ['button', 'link', 'navigation', 'main', 'banner'],
};
