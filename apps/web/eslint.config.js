module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // Define any specific rules or override defaults here
  },
  ignores: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.next',
    'public',
    'out',
    'yarn.lock',
    'package-lock.json',
    'apps/web/full_test_results.txt',
    'apps/web/test_results.txt',
  ],
};
