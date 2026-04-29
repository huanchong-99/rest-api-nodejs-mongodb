const js = require('@eslint/js');
const nPlugin = require('eslint-plugin-n');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // Base recommended rules
  js.configs.recommended,

  // Prettier compatibility (disables conflicting rules)
  prettierConfig,

  // Global ignores
  {
    ignores: ['node_modules/', 'coverage/', 'dist/', 'build/', 'public/'],
  },

  // Main config for all JS files (including bin/www which has no extension)
  {
    files: ['**/*.js', 'bin/www'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...require('globals').node,
        ...require('globals').es2020,
        jest: 'readonly',
      },
    },
    plugins: {
      n: nPlugin,
    },
    rules: {
      // Node plugin recommended rules
      'n/no-missing-require': 'off',
      'n/no-deprecated-api': 'warn',
      'n/no-process-exit': 'off',
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error',

      // Disallow unused variables
      'no-unused-vars': ['warn', { argsIgnorePattern: '^next$|^_' }],

      // Enforce consistent return
      'consistent-return': 'warn',

      // Warn on console.log usage
      'no-console': 'warn',

      // Require error handling
      'no-async-promise-executor': 'error',

      // Best practices
      'no-throw-literal': 'error',
      'no-unsafe-finally': 'error',
      'no-useless-catch': 'error',

      // Stylistic
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'always'],

      // Downgraded to warn for compatibility with existing code patterns
      'no-redeclare': 'warn',
    },
  },

  // Allow console in startup files
  {
    files: ['bin/www', 'app.js', 'src/app.js', 'src/server.js', 'config/index.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Test files - Jest and Vitest globals
  {
    files: ['tests/**/*.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
        before: 'readonly',
        after: 'readonly',
        describe: 'readonly',
      },
    },
  },
];
