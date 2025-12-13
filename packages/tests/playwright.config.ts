// This file is part of midnight-docs.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright Configuration - Best Practices for SDET
 *
 * Key Principles:
 * 1. Test Isolation - Each test runs independently
 * 2. Retries - Handle flaky tests gracefully
 * 3. Parallel Execution - Maximize test speed
 * 4. Multiple Browsers - Ensure cross-browser compatibility
 * 5. Rich Reporting - Debug failures quickly
 */
export default defineConfig({
	// Test directory structure
	testDir: './',

	// Global timeout for each test (60 seconds)
	timeout: 60000,

	// Timeout for each assertion (10 seconds)
	expect: {
		timeout: 10000,
	},

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only (not locally for faster feedback)
	retries: process.env.CI ? 2 : 0,

	// Limit workers on CI for stability, use all cores locally
	workers: process.env.CI ? 2 : undefined,

	// Reporter configuration
	reporter: [
		// List reporter for terminal output
		['list'],
		// HTML reporter for detailed test results
		['html', { outputFolder: 'playwright-report', open: 'never' }],
		// JSON reporter for CI/CD integration
		['json', { outputFile: 'test-results/results.json' }],
		// JUnit reporter for Jenkins/other CI systems
		['junit', { outputFile: 'test-results/junit.xml' }],
	],

	// Shared settings for all projects
	use: {
		// Base URL for navigation (can be overridden by BASE_URL env var)
		baseURL: process.env.BASE_URL || 'http://localhost:3000',

		// Collect trace on first retry of a failed test
		trace: 'on-first-retry',

		// Take screenshot only when test fails
		screenshot: 'only-on-failure',

		// Record video only when retrying a test
		video: 'retain-on-failure',

		// Navigation timeout (30 seconds)
		navigationTimeout: 30000,

		// Action timeout (10 seconds per action like click, fill, etc.)
		actionTimeout: 10000,
	},

	// Configure projects for major browsers
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Viewport size
				viewport: { width: 1920, height: 1080 },
			},
		},

		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1920, height: 1080 },
			},
		},

		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				viewport: { width: 1920, height: 1080 },
			},
		},

		// Mobile viewports
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
			},
		},

		{
			name: 'mobile-safari',
			use: {
				...devices['iPhone 13'],
			},
		},

		// Tablet viewports
		{
			name: 'tablet',
			use: {
				...devices['iPad Pro'],
			},
		},
	],

	// Output folder for test artifacts
	outputDir: 'test-results/',
});
