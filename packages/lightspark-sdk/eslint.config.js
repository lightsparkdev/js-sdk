import base from '@lightsparkdev/eslint-config/base';

export default [
  ...base,
  {
    files: ['**/*.ts?(x)'],
    ignores: ['**/tests/**/*.ts?(x)'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['./src/objects/**/*.ts?(x)'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
