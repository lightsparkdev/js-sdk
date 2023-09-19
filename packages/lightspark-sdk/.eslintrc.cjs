module.exports = {
  extends: ["@lightsparkdev/eslint-config/base"],
  ignorePatterns: ["jest.config.ts", "lightspark_crypto.js"],
  overrides: [
    {
      files: ["./src/objects/**/*.ts?(x)"],
      rules: {
        /* Temporarily turn off no-explicit-any until these can be resolved LIG-3400: */
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
