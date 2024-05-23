import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Go to the starting URL before login
  await page.goto('http://localhost:3000/');

  // Output for debugging
  console.log('Navigated to login page.');
  console.log('Current URL before clicking Log in button:', await page.url());

  // Wait for the login button to be visible and output its properties for debugging
  await page.waitForSelector('text=Sign in', { state: 'visible', timeout: 60000 });
  console.log('Log in button visibility before clicking:', await page.isVisible('text=Sign in'));
  console.log('Log in button bounding box:', await page.locator('text=Sign in').boundingBox());
  console.log(
    'Log in button computed styles:',
    await page.locator('text=Sign in').evaluate((node) => window.getComputedStyle(node)),
  );

  // Wait for the network to be idle to ensure the page has fully loaded
  await page.waitForLoadState('networkidle');

  // Click on the login button
  console.log('Attempting to click the Log in button.');
  await page.click('text=Sign in');
  console.log('Clicked the Log in button.');

  // Wait for navigation after login
  await page.waitForNavigation();

  // Output current URL after login
  console.log('Current URL after login:', await page.url());

  // Assertions to ensure that the login was successful and the expected page is reached
  expect(await page.url()).toContain('/dashboard');
});
