module.exports = {
  extends: ["@lightsparkdev/eslint-config/base"],
  ignorePatterns: ["jest.config.ts"],
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      // parserOptions: {
      //   /* Allow linting for ts files outside src with tsconfig-eslint: */
      //   project: ["./tsconfig.json", "./tsconfig-eslint.json"],
      // },
      rules: {
        /* Temporarily turn off no-explicit-any until these can be resolved LIG-3400: */
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
