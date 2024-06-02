import { test, expect } from '@playwright/test';

test('Llavero Web Application Integration Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Wait for the login page to load completely
  await page.waitForLoadState('load');

  // Check if the login form is visible
  const isLoginFormVisible = await page.isVisible('input[name="username"]');

  if (isLoginFormVisible) {
    // Click the "Log in" button
    await page.click('[devin-id="3"]');

    // Wait for the login form to be visible
    await page.waitForSelector('input[name="username"]', { state: 'visible' });
    await page.waitForSelector('input[name="password"]', { state: 'visible' });

    // Fill in the login form
    await page.fill('input[name="username"]', process.env.LLAVERO_USERNAME || '');
    await page.fill('input[name="password"]', process.env.LLAVERO_PASSWORD || '');

    // Click the "Sign in" button
    await page.click('text=Sign in');

    // Wait for navigation to the main page
    await page.waitForNavigation();

    // Check if the user is logged in by looking for a user profile icon or logout button
    const isLoggedIn =
      (await page.isVisible('[devin-id="user-profile-icon"]')) ||
      (await page.isVisible('text=Logout'));
    if (!isLoggedIn) {
      throw new Error('Login failed: User profile icon or logout button not found');
    }
  }

  // Wait for the "My Settings" button to be visible and interactable
  await page.waitForSelector('[devin-id="30"]', { state: 'visible' });
  await page.waitForSelector('[devin-id="30"]', { state: 'attached' });

  // Navigate to "My Settings"
  await page.click('[devin-id="30"]');

  // Wait for the "Accounts" button to be visible and interactable
  await page.waitForSelector('[devin-id="25"]', { state: 'visible' });
  await page.waitForSelector('[devin-id="25"]', { state: 'attached' });

  // Navigate to "Accounts"
  await page.click('[devin-id="25"]');

  // Wait for the "Dashboard" button to be visible and interactable
  await page.waitForSelector('[devin-id="27"]', { state: 'visible' });
  await page.waitForSelector('[devin-id="27"]', { state: 'attached' });

  // Navigate to "Dashboard"
  await page.click('[devin-id="27"]');

  // Select the Mumbai network
  await page.selectOption('select[name="network"]', 'Mumbai');

  // Verify that the navigation was successful
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
