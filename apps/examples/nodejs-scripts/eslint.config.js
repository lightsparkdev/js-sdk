import base from "@lightsparkdev/eslint-config/flat/base.mjs";

export default [
  ...base,
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
