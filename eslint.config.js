module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      globals: {
        browser: true,
        es6: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          args: 'none',
        },
      ],
      'react/prop-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        alias: {
          map: [
            ['@renderer', './src/renderer'],
            ['@components', './src/renderer/components'],
            ['@common', './src/common'],
            ['@main', './src/main'],
            ['@src', './src'],
            ['@assets', './assets'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: 'latest',
      },
    },
    ignores: ['build', 'node_modules', '.github'],
  },
];
