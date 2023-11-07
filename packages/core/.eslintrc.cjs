module.exports = {
  extends: ["@lightsparkdev/eslint-config/base"],
  ignorePatterns: ["jest.config.ts", "tsup.config.ts"],
  overrides: [
    {
      files: ["**/tests/*.ts?(x)"],
      parserOptions: {
        /* Allow linting for test files with tsconfig-test: */
        project: ["./tsconfig-test.json"],
      },
    },
  ],
};
