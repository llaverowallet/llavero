import { test, expect } from '@playwright/test';

test('Llavero Web App Integration Test', async ({ page }) => {
  // Retrieve login credentials from environment variables
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Wait for the network to be idle
  await page.waitForLoadState('networkidle');

  // Wait for the "Log in" button to be visible
  console.log('Checking for the presence of the "Log in" button...');
  const loginButtonPresent = (await page.$('#login-button')) !== null;
  console.log(`"Log in" button present: ${loginButtonPresent}`);

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
      return {
        display: window.getComputedStyle(loginButton).display,
        visibility: window.getComputedStyle(loginButton).visibility,
        opacity: window.getComputedStyle(loginButton).opacity,
      };
    }
    return null;
  });
  console.log(`"Log in" button computed styles: ${JSON.stringify(loginButtonStyles)}`);

  // Click the "Log in" button
  await page.click('#login-button');

  // Wait for the Cognito login page to load
  await page.waitForLoadState('networkidle');

  // Log the visibility status of the input fields on the Cognito login page
  const usernameFieldVisible = await page.isVisible('input[name="username"]');
  const passwordFieldVisible = await page.isVisible('input[name="password"]');
  console.log(`"Username" field visible: ${usernameFieldVisible}`);
  console.log(`"Password" field visible: ${passwordFieldVisible}`);

  // Log the bounding client rect of the input fields on the Cognito login page
  const usernameFieldRect = await page.evaluate(() => {
    const usernameField = document.querySelector('input[name="username"]');
    return usernameField ? usernameField.getBoundingClientRect().toJSON() : null;
  });
  const passwordFieldRect = await page.evaluate(() => {
    const passwordField = document.querySelector('input[name="password"]');
    return passwordField ? passwordField.getBoundingClientRect().toJSON() : null;
  });
  console.log(`"Username" field bounding client rect: ${JSON.stringify(usernameFieldRect)}`);
  console.log(`"Password" field bounding client rect: ${JSON.stringify(passwordFieldRect)}`);

  // Log the computed styles of the input fields on the Cognito login page
  const usernameFieldStyles = await page.evaluate(() => {
    const usernameField = document.querySelector('input[name="username"]');
    if (usernameField) {
      const computedStyles = window.getComputedStyle(usernameField);
      return {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
      };
    }
    return null;
  });
  const passwordFieldStyles = await page.evaluate(() => {
    const passwordField = document.querySelector('input[name="password"]');
    if (passwordField) {
      return {
        display: window.getComputedStyle(passwordField).display,
        visibility: window.getComputedStyle(passwordField).visibility,
        opacity: window.getComputedStyle(passwordField).opacity,
      };
    }
    return null;
  });
  console.log(`"Username" field computed styles: ${JSON.stringify(usernameFieldStyles)}`);
  console.log(`"Password" field computed styles: ${JSON.stringify(passwordFieldStyles)}`);

  // Wait for the username and password fields to be visible and enabled
  await page.waitForSelector('input[name="username"]', { state: 'visible' });
  await page.waitForSelector('input[name="password"]', { state: 'visible' });

  // Log the visibility status of the input fields on the Cognito login page after waiting
  const usernameFieldVisibleAfterWait = await page.isVisible('input[name="username"]');
  const passwordFieldVisibleAfterWait = await page.isVisible('input[name="password"]');
  console.log(`"Username" field visible after wait: ${usernameFieldVisibleAfterWait}`);
  console.log(`"Password" field visible after wait: ${passwordFieldVisibleAfterWait}`);

  // Log the bounding client rect of the input fields on the Cognito login page after waiting
  const usernameFieldRectAfterWait = await page.evaluate(() => {
    const usernameField = document.querySelector('input[name="username"]');
    return usernameField ? usernameField.getBoundingClientRect().toJSON() : null;
  });
  const passwordFieldRectAfterWait = await page.evaluate(() => {
    const passwordField = document.querySelector('input[name="password"]');
    return passwordField ? passwordField.getBoundingClientRect().toJSON() : null;
  });
  console.log(
    `"Username" field bounding client rect after wait: ${JSON.stringify(usernameFieldRectAfterWait)}`,
  );
  console.log(
    `"Password" field bounding client rect after wait: ${JSON.stringify(passwordFieldRectAfterWait)}`,
  );

  // Log the computed styles of the input fields on the Cognito login page after waiting
  const usernameFieldStylesAfterWait = await page.evaluate(() => {
    const usernameField = document.querySelector('input[name="username"]');
    if (usernameField) {
      const computedStyles = window.getComputedStyle(usernameField);
      return {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
      };
    }
    return null;
  });
  const passwordFieldStylesAfterWait = await page.evaluate(() => {
    const passwordField = document.querySelector('input[name="password"]');
    if (passwordField) {
      return {
        display: window.getComputedStyle(passwordField).display,
        visibility: window.getComputedStyle(passwordField).visibility,
        opacity: window.getComputedStyle(passwordField).opacity,
      };
    }
    return null;
  });
  console.log(
    `"Username" field computed styles after wait: ${JSON.stringify(usernameFieldStylesAfterWait)}`,
  );
  console.log(
    `"Password" field computed styles after wait: ${JSON.stringify(passwordFieldStylesAfterWait)}`,
  );

  // Enter the login credentials on the Cognito login page
  await page.fill('input[name="username"]', email);
  await page.fill('input[name="password"]', password);

  // Click the "Sign in" button on the Cognito login page
  await page.click('input[name="signInSubmitButton"]');

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
