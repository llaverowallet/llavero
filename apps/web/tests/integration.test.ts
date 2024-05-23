import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Click the "Log in" button
  await page.click('#login-button');

  // Wait for the Cognito login page to load
  await page.waitForLoadState('networkidle');

  // Wait for the Cognito login page URL
  console.log('Waiting for Cognito login page URL...');
  await page.waitForURL('https://llavero8hzd0ranu.auth.us-east-2.amazoncognito.com/login*');
  console.log('Cognito login page URL loaded.');

  // Wait for the username input field to be visible
  console.log('Waiting for username input field to be visible...');
  await page.waitForSelector('[devin-id="0"]', { state: 'visible' });
  console.log('Username input field is visible.');

  // Wait for the "Sign in" button to be visible
  console.log('Waiting for "Sign in" button to be visible...');
  await page.waitForSelector('[name="signInSubmitButton"]', { state: 'visible' });
  console.log('Sign in button is visible.');

  // Fill in the username and password fields
  console.log('Filling in the username and password fields...');
  await page.fill('[devin-id="0"]', process.env.EMAIL);
  await page.fill('[devin-id="1"]', process.env.PASSWORD);
  console.log('Username and password fields filled.');

  // Click the "Sign in" button
  console.log('Clicking the "Sign in" button...');
  await page.click('[name="signInSubmitButton"]');
  console.log('Sign in button clicked.');

  // Wait for navigation to the dashboard
  console.log('Waiting for navigation to the dashboard...');
  await page.waitForNavigation();
  console.log('Navigation to the dashboard completed.');

  // Navigate to "My Settings"
  console.log('Navigating to "My Settings"...');
  await page.click('[devin-id="my-settings-link"]');
  await expect(page).toHaveURL('http://localhost:3000/my-settings');
  console.log('Navigated to "My Settings".');

  // Navigate to "Accounts"
  console.log('Navigating to "Accounts"...');
  await page.click('[devin-id="accounts-link"]');
  await expect(page).toHaveURL('http://localhost:3000/accounts');
  console.log('Navigated to "Accounts".');

  // Navigate to "Dashboard"
  console.log('Navigating to "Dashboard"...');
  await page.click('[devin-id="dashboard-link"]');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  console.log('Navigated to "Dashboard".');

  // Select the Mumbai network
  console.log('Selecting the Mumbai network...');
  await page.click('[devin-id="mumbai-network"]');
  console.log('Mumbai network selected.');
});
