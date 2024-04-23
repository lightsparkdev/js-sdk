module.exports = {
  extends: ["@lightsparkdev/eslint-config/react-lib"],
  /* Mainly keeping this file around for reference for future public react lib, ignore in lint: */
  ignorePatterns: ["src/generated/"],
  overrides: [
    {
      files: ["**/src/**/*.ts?(x)"],
      excludedFiles: ["**/tests/**/*.ts?(x)"],
      rules: {
        /* Temporarily turn off no-explicit-any until these can be resolved LIG-3400: */
        "@typescript-eslint/no-explicit-any": "off",
        /* Too many of these type-aware errors, turn off for now: */
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
  ],
};
