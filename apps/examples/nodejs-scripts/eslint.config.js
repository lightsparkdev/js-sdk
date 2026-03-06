import base from "@lightsparkdev/eslint-config/base";

export default [
  ...base,
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
