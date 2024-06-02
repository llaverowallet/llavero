import { test, expect } from '@playwright/test';

test('Llavero Web Application Integration Test', async ({ page }) => {
  console.log('Navigating to the login page');
  // Navigate to the login page
  await page.goto('http://localhost:3000', { timeout: 60000 }); // Increase timeout to 60 seconds
  console.log('Navigation to the login page completed');

  console.log('Waiting for the login page to load completely');
  // Wait for the login page to load completely
  await page.waitForLoadState('load');

  console.log('Ensuring the "Log in" button is visible and interactable');
  let isLogInButtonVisible = false;
  let retryCountLogInButton = 0;
  const maxRetriesLogInButton = 5;
  const retryDelayLogInButton = 2000; // 2 seconds

  while (!isLogInButtonVisible && retryCountLogInButton < maxRetriesLogInButton) {
    console.log(
      `The "Log in" button is not visible, retrying... (${retryCountLogInButton + 1}/${maxRetriesLogInButton})`,
    );
    await page.waitForTimeout(retryDelayLogInButton); // Wait for 2 seconds before retrying
    await page.waitForLoadState('load'); // Ensure the page has fully loaded
    await page.waitForFunction(() => document.readyState === 'complete'); // Wait for the document to be fully loaded
    const logInButtonHandle = await page.waitForSelector('#login-btn', {
      state: 'visible',
      timeout: retryDelayLogInButton,
    });
    isLogInButtonVisible = !!logInButtonHandle;
    retryCountLogInButton++;
  }

  if (!isLogInButtonVisible) {
    throw new Error('The "Log in" button is not visible after multiple retries');
  }

  await page.waitForSelector('#login-btn:not([disabled])', { state: 'visible' });

  console.log('Clicking the "Log in" button');
  // Log the current URL before clicking the "Log in" button
  console.log(`Current URL before clicking "Log in": ${page.url()}`);
  // Log the state of the "Log in" button before clicking it
  isLogInButtonVisible = await page.isVisible('#login-btn');
  console.log(`Is "Log in" button visible: ${isLogInButtonVisible}`);
  if (!isLogInButtonVisible) {
    console.log('The "Log in" button is not visible, retrying...');
    await page.waitForTimeout(2000); // Wait for 2 seconds before retrying
    await page.reload(); // Reload the page and retry
    console.log(`Current URL after reloading: ${page.url()}`);
    const isLogInButtonVisibleAfterReload = await page.isVisible('#login-btn');
    console.log(`Is "Log in" button visible after reloading: ${isLogInButtonVisibleAfterReload}`);
    if (!isLogInButtonVisibleAfterReload) {
      // Check if the page is redirected to the Amazon Cognito login page
      if (page.url().includes('amazoncognito.com/login')) {
        console.log('Redirected to Amazon Cognito login page');
        // Wait for the page to fully load
        await page.waitForLoadState('load');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => document.readyState === 'complete'); // Wait for the document to be fully loaded

        // Ensure the Cognito login form elements are visible before interacting with them
        await page.waitForSelector('input[name="username"]', {
          state: 'visible',
          timeout: 20000, // Increase timeout to 20 seconds
        });
        await page.waitForSelector('input[name="password"]', {
          state: 'visible',
          timeout: 20000, // Increase timeout to 20 seconds
        });
        await page.waitForSelector('button[name="signInSubmitButton"]:not([disabled])', {
          state: 'visible',
          timeout: 20000, // Increase timeout to 20 seconds
        });
        await page.waitForSelector('input[name="username"]:not([disabled])', {
          state: 'visible',
          timeout: 20000, // Increase timeout to 20 seconds
        });
        await page.waitForSelector('input[name="password"]:not([disabled])', {
          state: 'visible',
          timeout: 20000, // Increase timeout to 20 seconds
        });

        // Retry mechanism for the Cognito login form elements
        let isCognitoLoginFormVisible = false;
        let cognitoRetryCount = 0;
        const cognitoMaxRetries = 5;
        const cognitoRetryDelay = 2000; // 2 seconds

        while (!isCognitoLoginFormVisible && cognitoRetryCount < cognitoMaxRetries) {
          console.log(
            `Cognito login form is not visible, retrying... (${cognitoRetryCount + 1}/${cognitoMaxRetries})`,
          );
          await page.waitForTimeout(cognitoRetryDelay); // Wait for 2 seconds before retrying
          await page.waitForLoadState('networkidle'); // Wait for the network to be idle
          await page.waitForFunction(() => document.readyState === 'complete'); // Wait for the document to be fully loaded
          isCognitoLoginFormVisible =
            (await page.isVisible('input[name="username"]')) &&
            (await page.isVisible('input[name="password"]')) &&
            (await page.isVisible('button[name="signInSubmitButton"]')) &&
            (await page.isEnabled('input[name="username"]')) &&
            (await page.isEnabled('input[name="password"]')) &&
            (await page.isEnabled('button[name="signInSubmitButton"]'));
          console.log(`Email input visible: ${await page.isVisible('input[name="username"]')}`);
          console.log(`Password input visible: ${await page.isVisible('input[name="password"]')}`);
          console.log(
            `Sign in button visible: ${await page.isVisible('button[name="signInSubmitButton"]')}`,
          );
          console.log(`Email input enabled: ${await page.isEnabled('input[name="username"]')}`);
          console.log(`Password input enabled: ${await page.isEnabled('input[name="password"]')}`);
          console.log(
            `Sign in button enabled: ${await page.isEnabled('button[name="signInSubmitButton"]')}`,
          );
          console.log(`Current URL during retry: ${page.url()}`);
          console.log(`Page content during retry: ${await page.content()}`);
          if (!isCognitoLoginFormVisible) {
            await page.reload(); // Reload the page and retry
          }
          cognitoRetryCount++;
        }

        if (!isCognitoLoginFormVisible) {
          console.log('Cognito login form is not visible after multiple retries');
          console.log(`Final URL: ${page.url()}`);
          console.log(`Final page content: ${await page.content()}`);
          throw new Error('Cognito login form is not visible after multiple retries');
        }

        console.log('Cognito login form elements are visible');
        // Fill in the Cognito login form using environment variables for credentials
        await page.fill('input[name="username"]', process.env.LLAVERO_EMAIL as string);
        await page.fill('input[name="password"]', process.env.LLAVERO_PASSWORD as string);
        // Wait for the "Sign in" button to be enabled before clicking it
        await page.waitForSelector('button[name="signInSubmitButton"]:not([disabled])');
        // Click the "Sign in" button on the Cognito login page
        await page.click('button[name="signInSubmitButton"]');
        console.log('Clicked the "Sign in" button on the Cognito login page');
        // Wait for navigation back to the main page
        await page.waitForNavigation({ waitUntil: 'networkidle' });
      } else {
        throw new Error('The "Log in" button is not visible after reloading');
      }
    } else {
      await page.click('#login-btn'); // Click the "Log in" button
    }
  } else {
    await page.click('#login-btn'); // Click the "Log in" button
  }

  console.log('Waiting for the login form to be visible');
  let isLoginFormVisible = await page.isVisible('[devin-id="0"]');
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  while (!isLoginFormVisible && retryCount < maxRetries) {
    console.log(`The login form is not visible, retrying... (${retryCount + 1}/${maxRetries})`);
    await page.waitForTimeout(retryDelay); // Wait for 2 seconds before retrying
    await page.reload(); // Reload the page and retry
    // Log the current URL after reloading the page
    console.log(`Current URL after reloading: ${page.url()}`);
    // Log the state of the "Log in" button after reloading the page
    const isLogInButtonVisibleAfterReload = await page.isVisible('#login-btn');
    console.log(`Is "Log in" button visible after reloading: ${isLogInButtonVisibleAfterReload}`);
    if (isLogInButtonVisibleAfterReload) {
      await page.click('#login-btn'); // Click the "Log in" button again
    }
    // Log the state of the login form after reloading the page
    isLoginFormVisible = await page.isVisible('[devin-id="0"]');
    console.log(`Is login form visible after reloading: ${isLoginFormVisible}`);
    // Log the page content after reloading the page
    console.log(`Page content after reloading: ${await page.content()}`);
    retryCount++;
  }

  if (!isLoginFormVisible) {
    console.log('The login form is not visible after multiple retries');
    console.log(`Final URL: ${page.url()}`);
    console.log(`Final page content: ${await page.content()}`);
    throw new Error('The login form is not visible after multiple retries');
  }

  console.log('Login form is visible, filling in the login form');
  // Ensure the email and password input fields are visible before filling them out
  await page.waitForSelector('input[name="username"]', { state: 'visible' });
  await page.waitForSelector('input[name="password"]', { state: 'visible' });

  if (!process.env.LLAVERO_EMAIL || !process.env.LLAVERO_PASSWORD) {
    throw new Error('Environment variables for login credentials are not defined');
  }

  // Fill in the login form using environment variables for credentials
  await page.fill('input[name="username"]', process.env.LLAVERO_EMAIL as string);
  await page.fill('input[name="password"]', process.env.LLAVERO_PASSWORD as string);

  console.log('Clicking the "Sign in" button');
  // Wait for the "Sign in" button to be enabled before clicking it
  await page.waitForSelector('button[name="signInSubmitButton"]:not([disabled])');
  // Click the "Sign in" button
  await page.click('button[name="signInSubmitButton"]');

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
  let isMySettingsVisible = await page.isVisible('#my-settings-btn');
  let retryCountMySettings = 0;
  const maxRetriesMySettings = 5;
  const retryDelayMySettings = 2000; // 2 seconds

  while (!isMySettingsVisible && retryCountMySettings < maxRetriesMySettings) {
    console.log(
      `The "My Settings" button is not visible, retrying... (${retryCountMySettings + 1}/${maxRetriesMySettings})`,
    );
    await page.waitForTimeout(retryDelayMySettings); // Wait for 2 seconds before retrying
    await page.reload(); // Reload the page and retry
    isMySettingsVisible = await page.isVisible('#my-settings-btn');
    retryCountMySettings++;
  }

  if (!isMySettingsVisible) {
    throw new Error('The "My Settings" button is not visible after multiple retries');
  }

  console.log('Navigating to "My Settings"');
  // Navigate to "My Settings"
  await page.click('#my-settings-btn');

  console.log('Waiting for the "Accounts" button to be visible and interactable');
  // Wait for the "Accounts" button to be visible and interactable
  await page.waitForSelector('#accounts-btn', { state: 'visible' });
  await page.waitForSelector('#accounts-btn', { state: 'attached' });

  console.log('Navigating to "Accounts"');
  // Navigate to "Accounts"
  await page.click('#accounts-btn');

  console.log('Waiting for the "Dashboard" button to be visible and interactable');
  // Wait for the "Dashboard" button to be visible and interactable
  let isDashboardVisible = await page.isVisible('#dashboard-btn');
  retryCount = 0;

  while (!isDashboardVisible && retryCount < maxRetries) {
    console.log(
      `The "Dashboard" button is not visible, retrying... (${retryCount + 1}/${maxRetries})`,
    );
    await page.waitForTimeout(retryDelay); // Wait for 2 seconds before retrying
    await page.reload(); // Reload the page and retry
    isDashboardVisible = await page.isVisible('#dashboard-btn');
    retryCount++;
  }

  if (!isDashboardVisible) {
    throw new Error('The "Dashboard" button is not visible after multiple retries');
  }

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
