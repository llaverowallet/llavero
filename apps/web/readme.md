# Llavero Web Application

## Local Development Setup

### Requirements

- Node version v20.11.0 or higher
- Yarn package manager with workspace feature

### Steps to Set Up Local Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/llaverowallet/llavero.git
   cd llavero
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the Serverless Stack (sst) and Next.js development server in two separate terminals:

   **Terminal 1:**

   ```bash
   EMAIL="your@email.com" REGION="us-east-2" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn start-sst
   ```

   When prompted for a personal stage name, type `ranu`.

   **Terminal 2:**

   ```bash
   EMAIL="your@email.com" REGION="us-east-2" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn dev
   ```

### Build Command

To compile the Llavero web application, run:

```bash
yarn workspace web build-next
```

### Integration Testing with Playwright

#### Installation

Install Playwright and the required browsers:

```bash
yarn add @playwright/test
npx playwright install
```

#### Test File Location

The integration test file is located at:

```
apps/web/tests/integration.test.ts
```

#### Running Tests

To run the Playwright tests, use the Playwright CLI:

```bash
npx playwright test
```

### Helpful Tips

- Ensure that sensitive information, such as login credentials, is securely stored and handled during the development process. Use environment variables to store and access sensitive information securely.
- Document the integration test setup and execution steps for future reference and collaboration with the team.
- If you encounter issues with the visibility of elements during Playwright tests, use `page.evaluate` to log the bounding client rect and computed styles of the elements for debugging.
- Always check for ESLint errors and fix them before committing your changes. Use the following command to automatically fix linting errors:
  ```bash
  eslint --quiet --fix
  ```
- When debugging large systems, create tight, isolated testing loops by running individual tests that are failing, writing scripts to reproduce bugs apart from third-party calls, and ensuring linters are properly set up to catch errors before runtime.
- Use the `gh` CLI tool for making pull requests, checking build logs, and retrieving PR comments. Avoid pushing directly to the main branch and prefer merging over rebasing to prevent losing work.
- If you encounter an OAuthCallback error, ensure you access the Llavero web app directly via `http://localhost:3000` to avoid OAuthCallback errors.
- If you encounter an error with the `yarn start-sst` command due to the missing `sst` command, install the Serverless Stack (sst) CLI tool:
  ```bash
  yarn add sst
  ```
- For debugging Playwright tests, add console log statements to the integration test for debugging purposes. This can help identify why elements are not considered visible by Playwright.
- Update the integration test to handle redirection to the Cognito login page and interact with the input fields there.
- Ensure that the addition of IDs to HTML elements for easier querying by Playwright is included as a commit within the test PR.
- Update the integration test to retrieve credentials from environment variables and ensure that no test results are included in the commits.

### Common Issues

- **OAuthCallback Error:** Ensure you access the Llavero web app directly via `http://localhost:3000` to avoid OAuthCallback errors.
- **Missing `sst` Command:** If you encounter an error with the `yarn start-sst` command due to the missing `sst` command, install the Serverless Stack (sst) CLI tool:
  ```bash
  yarn add sst
  ```

### Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Shadcn UI Component Library](https://ui.shadcn.com/)

By following these steps and tips, you can set up the local environment for the Llavero Web application, perform integration and manual tests, and ensure the application's functionality.
