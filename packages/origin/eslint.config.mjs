import reactLib from "@lightsparkdev/eslint-config/react-lib";

export default [
  ...reactLib,
  {
    files: ["**/src/**/*.{ts,tsx}"],
    rules: {
      // Pre-existing issues in origin code — to be cleaned up incrementally.
      // Chart utilities use loosely-typed data structures from external charting libs.
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "playwright-report/",
      "test-results/",
      ".cache/",
      "tools/",
      "scripts/",
      "playwright/",
      "storybook-static/",
      // Test and story files live inside src/ but are excluded from tsconfig.json,
      // which breaks type-aware eslint rules. Ignore them from linting.
      "**/*.test.tsx",
      "**/*.test.ts",
      "**/*.unit.test.tsx",
      "**/*.unit.test.ts",
      "**/*.test-stories.tsx",
      "**/*.stories.tsx",
      // Dev-only Next.js app
      "src/app/",
    ],
  },
];
