import reactLib from "@lightsparkdev/eslint-config/react-lib";

export default [
  ...reactLib,
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
