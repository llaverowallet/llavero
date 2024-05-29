const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
  require('eslint-config-next/core-web-vitals'),
]);
