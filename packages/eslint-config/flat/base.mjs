import path from "node:path";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import commentLength from "eslint-plugin-comment-length";

const commentOptions = {
  mode: "overflow-only",
  maxLength: 100,
  ignoreUrls: true,
  // Disable code detection in comments to avoid parser resolution issues under ESLint 9
  ignoreCommentsWithCode: false,
  tabSize: 2,
};

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((c) => {
  const { plugins: _removeDupPlugins, ...rest } = c;
  return {
    ...rest,
    files: ["**/src/**/*.ts?(x)"],
    languageOptions: {
      ...(c.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        ...(c.languageOptions?.parserOptions ?? {}),
        project: [path.join(process.cwd(), "tsconfig.json")],
      },
    },
  };
});

export default [
  {
    ignores: [
      "build/*",
      "dist/*",
      "docs/*",
      "examples/*",
      "node_modules/*",
      "**/.*",
    ],
  },
  js.configs.recommended,
  // Base TypeScript rules (no type info required)
  ...tseslint.configs.recommended,
  // Type-aware rules for src/** files
  ...typeCheckedConfigs,
  // Test files use separate tsconfig
  {
    files: ["**/tests/**/*.ts?(x)"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.join(process.cwd(), "tsconfig-test.json")],
      },
    },
  },
  // Node-targeted JS outside src/
  {
    files: ["**/*.?(m|c)js?(x)"],
    ignores: ["**/src/**/*"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: { ...globals.node },
    },
  },
  // Rule customizations mirroring legacy base
  {
    plugins: {
      "comment-length": commentLength,
    },
    rules: {
      // TypeScript equivalents and toggles
      "default-case": "off",
      "no-dupe-class-members": "off",
      "no-undef": "off",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false, fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as" },
      ],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false, classes: false, variables: false, typedefs: false },
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
        { args: "none", ignoreRestSiblings: true },
      ],
      "no-array-constructor": "off",
      "@typescript-eslint/no-array-constructor": "warn",
      // Temporary workaround for plugin crash under ESLint 9 + TS 5.6
      "@typescript-eslint/no-duplicate-enum-values": "off",
      // Allow interface merging pattern: interface Foo extends Bar {}
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],

      // Other overrides
      "no-extra-boolean-cast": "off",
      "comment-length/limit-single-line-comments": ["error", commentOptions],
      "comment-length/limit-multi-line-comments": [
        "error",
        { tags: ["css"], ...commentOptions },
      ],
    },
  },
];
