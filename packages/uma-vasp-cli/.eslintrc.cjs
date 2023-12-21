module.exports = {
  extends: ["@lightsparkdev/eslint-config/base"],
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      excludedFiles: ["**/tests/**/*.ts?(x)"],
      rules: {
        /* Too many of these type-aware errors, turn off for now - revisit after docs migration: */
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
  ],
};
