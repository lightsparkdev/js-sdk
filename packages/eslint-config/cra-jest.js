// from https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/jest.js

"use strict";

// Fix eslint shareable config (https://github.com/eslint/eslint/issues/3458)
require("@rushstack/eslint-patch/modern-module-resolution");

// We use eslint-loader so even warnings are very visible.
// This is why we prefer to use "WARNING" level for potential errors,
// and we try not to use "ERROR" level at all.

module.exports = {
  plugins: ["jest"],
  overrides: [
    {
      extends: ["plugin:testing-library/react"],
      files: ["**/__tests__/**/*", "**/*.{spec,test}.*"],
      env: {
        "jest/globals": true,
      },
      // A subset of the recommended rules:
      rules: {
        // https://github.com/jest-community/eslint-plugin-jest
        "jest/no-conditional-expect": "error",
        "jest/no-identical-title": "error",
        "jest/no-interpolation-in-snapshots": "error",
        "jest/no-jasmine-globals": "error",
        "jest/no-mocks-import": "error",
        "jest/valid-describe-callback": "error",
        "jest/valid-expect": "error",
        "jest/valid-expect-in-promise": "error",
        "jest/valid-title": "warn",
      },
    },
  ],
};
