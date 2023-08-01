module.exports = {
  extends: ["@lightsparkdev/eslint-config/react-app"],

  overrides: [
    {
      files: ["**/*.ts?(x)"],
      parserOptions: {
        /* Allow linting for ts files outside src with tsconfig-eslint: */
        project: ["./tsconfig.json", "./tsconfig-eslint.json"],
      },
    },
  ],
};
