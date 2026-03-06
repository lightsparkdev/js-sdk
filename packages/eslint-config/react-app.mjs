import { createRequire } from 'node:module';
import reactLib from './react-lib.mjs';

const require = createRequire(import.meta.url);
const { reactAppRestrictedImports } = require('./constants/react-restricted-imports.js');

export default [
  { ignores: ['src/generated/'] },
  ...reactLib,
  {
    rules: {
      'no-restricted-imports': ['error', reactAppRestrictedImports],
    },
  },
];
