import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');
  console.log('Navigated to login page.');

  // Log the current URL before clicking the Log in button
  const currentURL = page.url();
  console.log('Current URL before clicking Log in button:', currentURL);

  // Check if the Log in button is visible before clicking
  const loginButton = await page.$('[devin-id="3"]');
  const loginButtonVisible = await loginButton?.isVisible();
  console.log('Log in button visibility before clicking:', loginButtonVisible);

  // Log the bounding box of the Log in button
  const loginButtonBoundingBox = await loginButton?.boundingBox();
  console.log('Log in button bounding box:', loginButtonBoundingBox);

  // Log the computed styles of the Log in button
  const loginButtonComputedStyles = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element || !(element instanceof Element)) return null;
    const styles = window.getComputedStyle(element);
    return {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
    };
  }, '[devin-id="3"]');
  console.log('Log in button computed styles:', loginButtonComputedStyles);

  // Click the Log in button
  await page.click('[devin-id="3"]');
  console.log('Clicked on login button.');

  // Wait for the Cognito login page to load
  console.log('Waiting for Cognito login page to load...');
  await page.waitForLoadState('networkidle');
  console.log('Cognito login page loaded.');

  // Wait for the Cognito login page URL
  console.log('Waiting for Cognito login page URL...');
  await page.waitForURL('https://llavero8hzd0ranu.auth.us-east-2.amazoncognito.com/login*', {
    timeout: 60000,
  });
  console.log('Cognito login page URL loaded.');

  // Wait for the username input field to be visible
  console.log('Waiting for username input field to be visible...');
  await page.waitForSelector('[devin-id="0"]', { state: 'visible', timeout: 60000 });
  console.log('Username input field is visible.');

  // Additional logging to diagnose the issue
  const usernameField = await page.$('[devin-id="0"]');
  const usernameFieldVisible = await usernameField?.isVisible();
  console.log('Username field visibility:', usernameFieldVisible);

  // Fill in the username and password fields
  console.log('Filling in the username and password fields...');
  await page.fill('[devin-id="0"]', process.env.EMAIL);
  await page.fill('[devin-id="1"]', process.env.PASSWORD);
  console.log('Username and password fields filled.');

  // Click the Sign in button
  console.log('Clicking the Sign in button...');
  await page.click('[devin-id="3"]');
  console.log('Sign in button clicked.');

  // Wait for navigation to the dashboard
  console.log('Waiting for navigation to the dashboard...');
  await page.waitForNavigation({ timeout: 60000 });
  console.log('Navigation to the dashboard completed.');

  // Navigate to My Settings
  console.log('Navigating to My Settings...');
  await page.click('[devin-id="my-settings-link"]');
  await expect(page).toHaveURL('http://localhost:3000/my-settings');
  console.log('Navigated to My Settings.');

  // Navigate to Accounts
  console.log('Navigating to Accounts...');
  await page.click('[devin-id="accounts-link"]');
  await expect(page).toHaveURL('http://localhost:3000/accounts');
  console.log('Navigated to Accounts.');

  // Navigate to Dashboard
  console.log('Navigating to Dashboard...');
  await page.click('[devin-id="dashboard-link"]');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  console.log('Navigated to Dashboard.');

  // Select the Mumbai network
  console.log('Selecting the Mumbai network...');
  await page.click('[devin-id="mumbai-network"]');
  console.log('Mumbai network selected.');
});
