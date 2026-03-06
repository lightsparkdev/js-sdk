import base from '@lightsparkdev/eslint-config/flat/base.mjs';

export default [
  ...base,
  {
    files: ['**/*.ts?(x)'],
    ignores: ['**/tests/**/*.ts?(x)'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
