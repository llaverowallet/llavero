import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Click the "Log in" button
  await page.click('#login-button');

  // Wait for the Cognito login page to load
  await page.waitForLoadState('networkidle');

  // Fill in the username and password fields
  await page.fill('[devin-id="0"]', process.env.EMAIL);
  await page.fill('[devin-id="1"]', process.env.PASSWORD);

  // Click the "Sign in" button
  await page.click('[name="signInSubmitButton"]');

  // Wait for navigation to the dashboard
  await page.waitForNavigation();

  // Navigate to "My Settings"
  await page.click('[devin-id="my-settings-link"]');
  await expect(page).toHaveURL('http://localhost:3000/my-settings');

  // Navigate to "Accounts"
  await page.click('[devin-id="accounts-link"]');
  await expect(page).toHaveURL('http://localhost:3000/accounts');

  // Navigate to "Dashboard"
  await page.click('[devin-id="dashboard-link"]');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');

  // Select the Mumbai network
  await page.click('[devin-id="mumbai-network"]');
});
