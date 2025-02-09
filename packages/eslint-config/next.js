const { resolve } = require('node:path')
const shared = require('./shared')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'turbo',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    require.resolve('@vercel/style-guide/eslint/next'),
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: project,
  },

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)', '*.mjs'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
  ],
  rules: {
    ...shared,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-useless-path-segments': 'error',
    'object-curly-newline': 0,
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/comma-dangle': 0,
    'react/no-children-prop': 0,
    'react/react-in-jsx-scope': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'react/no-array-index-key': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'react/function-component-definition': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'react/jsx-no-useless-fragment': [
      1,
      {
        allowExpressions: true,
      },
    ],
    'react/no-unstable-nested-components': [
      1,
      {
        allowAsProps: true,
      },
    ],
    'react/jsx-no-duplicate-props': [
      1,
      {
        ignoreCase: false,
      },
    ],
  },
}
