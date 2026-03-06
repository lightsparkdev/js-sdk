import { createRequire } from 'node:module';
import reactApp from './react-app.mjs';

const require = createRequire(import.meta.url);
const { reactAppRestrictedImports } = require('../constants/react-restricted-imports.js');

const appWithInternalUiRestricted = {
  ...reactAppRestrictedImports,
  patterns: [
    ...reactAppRestrictedImports.patterns,
    {
      group: [
        '@lightsparkdev/ui/**',
        '!@lightsparkdev/ui/src',
        '!@lightsparkdev/ui/src/**',
      ],
      message:
        'This app can import directly from @lightsparkdev/ui/src to avoid requiring a build.',
    },
  ],
};

export default [
  ...reactApp,
  {
    rules: {
      'no-restricted-imports': ['error', appWithInternalUiRestricted],
    },
  },
];
