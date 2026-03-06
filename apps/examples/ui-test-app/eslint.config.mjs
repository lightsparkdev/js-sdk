import reactLib from '@lightsparkdev/eslint-config/react-lib';

export default [
  // Keep generated folder ignored
  { ignores: ['src/generated/'] },
  ...reactLib,
  {
    files: ['**/src/**/*.ts?(x)'],
    ignores: ['**/tests/**/*.ts?(x)'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
];
