'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
  },
  plugins: ['ember', 'prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  env: {
    browser: true,
    node: false,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'off',
  },
  overrides: [
    // node files
    {
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2022,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['n'],
      extends: ['plugin:n/recommended'],
    },
  ],
};
