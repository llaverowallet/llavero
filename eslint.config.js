const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');
const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-plugin-prettier');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('eslint:recommended'),
  ...compat.extends('plugin:react/recommended'),
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:jsx-a11y/strict'),
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        es6: true,
        node: true,
      },
    },
    plugins: {
      react: react,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Temporarily disable the react-hooks/exhaustive-deps rule
      'react-hooks/exhaustive-deps': 'off',
      'no-var': 'error',
      'brace-style': 'error',
      'prefer-template': 'error',
      'radix': 'error',
      'space-before-blocks': 'error',
      'import/prefer-default-export': 'off',
      // Temporarily disable the react/no-direct-mutation-state rule
      'react/no-direct-mutation-state': 'off',
      // Temporarily disable the react/no-string-refs rule
      'react/no-string-refs': 'off',
      // Temporarily disable the react/display-name rule
      'react/display-name': 'off',
      // Temporarily disable the react/prop-types rule
      'react/prop-types': 'off',
      // Temporarily disable the react/require-render-return rule
      'react/require-render-return': 'off',
      // Temporarily disable the @typescript-eslint/no-var-requires rule
      '@typescript-eslint/no-var-requires': 'off',
      // Temporarily disable the @typescript-eslint/no-unused-vars rule
      '@typescript-eslint/no-unused-vars': 'off',
      // Temporarily disable the @typescript-eslint/no-unsafe-declaration-merging rule
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      // Temporarily disable the react/jsx-no-undef rule
      'react/jsx-no-undef': 'off',
      // Temporarily disable the react/jsx-uses-react rule
      'react/jsx-uses-react': 'off',
      // Temporarily disable the react/jsx-uses-vars rule
      'react/jsx-uses-vars': 'off',
      // Temporarily disable the react/react-in-jsx-scope rule
      'react/react-in-jsx-scope': 'off',
      // Temporarily disable the react/no-danger-with-children rule
      'react/no-danger-with-children': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        browser: true,
        es6: true,
        node: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
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
        jest: 'readonly',
      },
    },
  },
  {
    ignores: ['build', 'node_modules', '.github'],
  },
];