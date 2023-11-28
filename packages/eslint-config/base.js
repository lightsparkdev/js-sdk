const path = require("path");

const commentOptions = {
  mode: "overflow-only",
  maxLength: 100,
  logicalWrap: true,
  ignoreUrls: true,
  ignoreCommentsWithCode: true,
  tabSize: 2,
};

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
      /* All Typescript files, including tests and files outside src: */
      files: ["**/*.ts?(x)"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:comment-length/recommended",
      ],
      parser: "@typescript-eslint/parser",
      rules: {
        /* TypeScript's `noFallthroughCasesInSwitch` option is more robust */
        "default-case": "off",
        /* tsc already handles this */
        "no-dupe-class-members": "off",
        /* tsc already handles this */
        "no-undef": "off",
        /* Add TypeScript specific rules (and turn off ESLint equivalents) */
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            /* Allow dynamic import() type refs: */
            disallowTypeAnnotations: false,
            fixStyle: "inline-type-imports",
          },
        ],
        "@typescript-eslint/consistent-type-assertions": [
          "error",
          { assertionStyle: "as" },
        ],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": [
          "error",
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
          },
        ],
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": [
          "error",
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "none",
            ignoreRestSiblings: true,
          },
        ],
        "no-array-constructor": "off",
        "@typescript-eslint/no-array-constructor": "warn",

        /* Other overrides */
        "no-extra-boolean-cast": "off",
        "comment-length/limit-single-line-comments": ["error", commentOptions],
        "comment-length/limit-multi-line-comments": ["error", commentOptions],
        "comment-length/limit-multi-line-comments": [
          "error",
          {
            tags: ["css"],
            ...commentOptions,
          },
        ],
      },
    },
    {
      /* Typescript files in workspace `src` folders with extra tsconfig aware lint rules: */
      files: ["**/src/**/*.ts?(x)"],
      excludedFiles: ["**/tests/**"],
      extends: ["plugin:@typescript-eslint/recommended-type-checked"],
      parserOptions: {
        project: [path.join(process.cwd(), "tsconfig.json")],
      },
      rules: {},
    },
    {
      /* Typescript test files: */
      files: ["**/tests/**/*.ts?(x)"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        /* Allow linting for test files with tsconfig-test: */
        project: [path.join(process.cwd(), "./tsconfig-test.json")],
      },
    },
    {
      /* Javascript files outside `src` directory, presumed to be Node.js config or scripts */
      files: ["**/*.?(m|c)js?(x)"],
      excludedFiles: ["**/src/**/*"],
      env: {
        node: true,
      },
      excludedFiles: ["**/src/**/*"],
      extends: ["eslint:recommended"],
    },
  ],
};
