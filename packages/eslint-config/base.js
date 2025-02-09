const { resolve } = require('node:path')
const shared = require('./shared')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier', 'plugin:import/typescript'],

  plugins: ['@typescript-eslint', 'prettier', 'jest'],

  env: {
    node: true,
    es2020: true,
  },

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project,
  },

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project,
      },
    },
  },

  rules: {
    ...shared,
  },
}
