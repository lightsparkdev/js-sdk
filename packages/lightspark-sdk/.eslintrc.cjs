module.exports = {
  extends: ["@lightsparkdev/eslint-config/base"],
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      excludedFiles: ["**/tests/**/*.ts?(x)"],
      rules: {
        /* Too many of these type-aware errors, turn off for now: */
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
    {
      files: ["./src/objects/**/*.ts?(x)"],
      rules: {
        /* Temporarily turn off no-explicit-any until these can be resolved LIG-3400: */
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
  ],
};
