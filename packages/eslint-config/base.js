const path = require("path");

module.exports = {
  root: true,

  ignorePatterns: [
    "build/*",
    "dist/*",
    /* Ignore top level docs folders where static docs are generated: */
    "docs/*",
    /* Ignore top level examples folders in some packages until they're moved into apps/examples */
    "examples/*",
    "node_modules/*",
  ],

  overrides: [
    {
      files: ["**/*.ts?(x)"],
      extends: ["plugin:@typescript-eslint/recommended"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: [path.join(process.cwd(), "tsconfig.json")],
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            /* Allow dynamic import() type refs: */
            disallowTypeAnnotations: false,
            fixStyle: "inline-type-imports",
          },
        ],
      },
    },
  ],
};
