const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');

module.exports = (config = {}) => {
  return defineConfig(
    {
      ignores: ['**/dist', '**/.react-router'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    prettier,
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/class-literal-property-style': 'off',
        '@typescript-eslint/prefer-interface': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrors: 'none',
          },
        ],
        ...(config.import && {
          '@typescript-eslint/consistent-type-imports': 'error',
        }),
      },
    },
  );
};
