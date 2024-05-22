import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Wait for the "Log in" button to be visible
  console.log('Waiting for the "Log in" button to be visible...');
  await page.waitForSelector('#login-button', { state: 'visible' });

  // Log the visibility status of the "Log in" button
  const loginButtonVisible = await page.isVisible('#login-button');
  console.log(`"Log in" button visible: ${loginButtonVisible}`);

  // Log the bounding client rect of the "Log in" button
  const loginButtonRect = await page.evaluate(() => {
    const loginButton = document.querySelector('#login-button');
    return loginButton ? loginButton.getBoundingClientRect().toJSON() : null;
  });
  console.log(`"Log in" button bounding client rect: ${JSON.stringify(loginButtonRect)}`);

  // Log the computed styles of the "Log in" button
  const loginButtonStyles = await page.evaluate(() => {
    const loginButton = document.querySelector('#login-button');
    if (loginButton) {
      const computedStyles = window.getComputedStyle(loginButton);
      return {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
      };
    }
    return null;
  });
  console.log(`"Log in" button computed styles: ${JSON.stringify(loginButtonStyles)}`);

  // Click the "Log in" button
  await page.click('#login-button');

  // Enter the login credentials
  await page.fill('input[name="username"]', 'elranu@gmail.com');
  await page.fill('input[name="password"]', 'Qqaazz1144$');

  // Click the "Sign in" button
  await page.click('button[type="submit"]');

  // Verify successful login by checking for the presence of the email button
  await expect(page.locator('[devin-id="6"]')).toBeVisible();

  // Navigate to "My Settings"
  await page.click('[devin-id="30"]');

  // Verify navigation to "My Settings" by checking for the presence of the "Accounts" link
  await expect(page.locator('[devin-id="25"]')).toBeVisible();

  // Navigate to "Accounts"
  await page.click('[devin-id="25"]');

  // Verify navigation to "Accounts" by checking for the presence of the "Dashboard" link
  await expect(page.locator('[devin-id="27"]')).toBeVisible();

  // Navigate to "Dashboard"
  await page.goto('http://localhost:3000/dashboard');

  // Verify navigation to "Dashboard" by checking for the presence of the "Dashboard" heading
  await expect(page.locator('h3')).toHaveText('Dashboard');
});
