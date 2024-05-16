# Llavero Next.js Web

This directory contains the front-end web application for Llavero Wallet, built with Next.js.

## Directory Structure Overview

- `src/`: Contains the source code for the web application.
  - `app/`: The main application logic and components.
    - Example: `app/client-layout.tsx` is the main layout component for the client-side application.
  - `features/`: Feature-specific modules and components.
    - Example: `features/accounts/index.tsx` serves as the entry point for account-related features.
  - `lib/`: Library code that provides utility functions and shared logic.
    - Example: `lib/utils.ts` might contain utility functions used across the application.
  - `models/`: Definitions of data models used in the application.
    - Example: `models/user-settings.models.ts` defines the settings related data model.
  - `repositories/`: Data access layers for interacting with APIs or databases.
    - Example: `repositories/user-repository.ts` provides functions to interact with user data.
  - `shared/`: Shared components and utilities used across different parts of the application.
    - Example: `shared/components/ui/button.tsx` is a reusable button component.
  - `store/`: State management using Redux or a similar library.
    - Example: `store/settingsStore.ts` contains the Redux slice for settings state.
- `public/`: Static files such as images and fonts that are served by the Next.js server.
  - Example: `public/favicon.ico` is the favicon for the web application.
- `styles/`: Contains CSS files for styling the application.
  - Example: `app/globals.css` contains global styles applied throughout the application.

## Configuration Files

- `next.config.js`: Configuration for the Next.js application.
- `tailwind.config.ts`: Configuration for Tailwind CSS.
- `postcss.config.js`: Configuration for PostCSS.
- `tsconfig.json`: TypeScript configuration.

## Additional Files

- `README.md`: Documentation for the web application (this file).
- `package.json`: Lists the dependencies and scripts for the project.
- `next-env.d.ts`: TypeScript declaration file for Next.js types.
- `sst/`: Contains infrastructure as code files for serverless deployment.

Please refer to individual directories for more detailed documentation on specific components and functionality.
