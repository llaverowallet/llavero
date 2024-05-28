const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ...js.configs.recommended,
    ignores: ['build', 'node_modules', '.github'],
    languageOptions: {
      globals: {
        browser: true,
        es6: true,
        node: true,
        jest: true,
      },
      parser: tsParser, // Correctly reference the TypeScript parser as an object
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'no-var': 'error',
      'brace-style': 'error',
      'prefer-template': 'error',
      radix: 'error',
      'space-before-blocks': 'error',
      'import/prefer-default-export': 'off',
    },
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
    },
  },
  {
    files: [
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.spec.tsx',
    ],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
  },
];
