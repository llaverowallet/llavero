import { test, expect } from '@playwright/test';

test('Llavero Web Application Integration Test', async ({ page }) => {
  console.log('Navigating to the login page');
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  console.log('Waiting for the login page to load completely');
  // Wait for the login page to load completely
  await page.waitForLoadState('load');

  console.log('Checking if the login form is visible');
  // Check if the login form is visible
  const isLoginFormVisible = await page.isVisible('input[name="username"]');

  if (isLoginFormVisible) {
    console.log('Login form is visible, filling in the login form');
    // Fill in the login form
    await page.fill('input[name="username"]', 'elranu@gmail.com');
    await page.fill('input[name="password"]', 'Ertsdf1144$');

    console.log('Clicking the "Sign in" button');
    // Click the "Sign in" button
    await page.click('[devin-id="3"]');

    console.log('Waiting for navigation to the main page');
    // Wait for navigation to the main page
    await page.waitForNavigation();

    console.log(
      'Checking if the user is logged in by looking for a user profile icon or logout button',
    );
    // Check if the user is logged in by looking for a user profile icon or logout button
    const isLoggedIn =
      (await page.isVisible('[devin-id="user-profile-icon"]')) ||
      (await page.isVisible('text=Logout'));
    if (!isLoggedIn) {
      console.log('Login failed: User profile icon or logout button not found');
      throw new Error('Login failed: User profile icon or logout button not found');
    } else {
      console.log('Login successful: User profile icon or logout button found');
    }
  }
  console.log('Verifying that the user is on the main page after login');
  // Verify that the user is on the main page after login
  await expect(page).toHaveURL('http://localhost:3000/');

  console.log('Logging the current URL after login attempt');
  const currentURL = page.url();
  console.log(`Current URL: ${currentURL}`);

  if (currentURL === 'http://localhost:3000/') {
    console.log('Login successful, user is on the main page');
  } else {
    console.log('Login unsuccessful, user is not on the main page');
    throw new Error('Login failed: User is not on the main page');
  }

  console.log('Waiting for the "My Settings" button to be visible and interactable');
  // Wait for the "My Settings" button to be visible and interactable
  let isMySettingsVisible = await page.isVisible('text=My Settings');
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  while (!isMySettingsVisible && retryCount < maxRetries) {
    console.log(
      `The "My Settings" button is not visible, retrying... (${retryCount + 1}/${maxRetries})`,
    );
    await page.waitForTimeout(retryDelay); // Wait for 2 seconds before retrying
    await page.reload(); // Reload the page and retry
    isMySettingsVisible = await page.isVisible('text=My Settings');
    retryCount++;
  }

  if (!isMySettingsVisible) {
    throw new Error('The "My Settings" button is not visible after multiple retries');
  }

  console.log('Navigating to "My Settings"');
  // Navigate to "My Settings"
  await page.click('[devin-id="30"]');

  console.log('Waiting for the "Accounts" button to be visible and interactable');
  // Wait for the "Accounts" button to be visible and interactable
  await page.waitForSelector('[devin-id="25"]', { state: 'visible' });
  await page.waitForSelector('[devin-id="25"]', { state: 'attached' });

  console.log('Navigating to "Accounts"');
  // Navigate to "Accounts"
  await page.click('[devin-id="25"]');

  console.log('Waiting for the "Dashboard" button to be visible and interactable');
  // Wait for the "Dashboard" button to be visible and interactable
  await page.waitForSelector('[devin-id="27"]', { state: 'visible' });
  await page.waitForSelector('[devin-id="27"]', { state: 'attached' });

  console.log('Navigating to "Dashboard"');
  // Navigate to "Dashboard"
  await page.click('[devin-id="27"]');

  console.log('Selecting the Mumbai network');
  // Select the Mumbai network
  await page.selectOption('select[name="network"]', 'Mumbai');

  console.log('Verifying that the navigation was successful');
  // Verify that the navigation was successful
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
