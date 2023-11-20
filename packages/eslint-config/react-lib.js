const restrictedGlobals = require("confusing-browser-globals");
const constants = require("./constants/react-restricted-imports");

module.exports = {
  extends: ["./base"],
  plugins: [
    "react",
    "import",
    "flowtype",
    "jsx-a11y",
    "react-hooks",
    "jest",
    "testing-library",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  overrides: [
    {
      files: ["**/src/**/*.ts?(x)"],
      excludedFiles: ["**/tests/**/*"],
      /* NOTE: When adding rules here, you need to make sure they are compatible with
        `typescript-eslint`, as some rules such as `no-array-constructor` aren't compatible. */
      rules: {
        "react/jsx-uses-vars": "warn",
        "react/jsx-uses-react": "warn",

        // http://eslint.org/docs/rules/
        "array-callback-return": "warn",
        "dot-location": ["warn", "property"],
        eqeqeq: ["warn", "smart"],
        "new-parens": "warn",
        "no-array-constructor": "warn",
        "no-caller": "warn",
        "no-cond-assign": ["warn", "except-parens"],
        "no-const-assign": "warn",
        "no-control-regex": "warn",
        "no-delete-var": "warn",
        "no-dupe-args": "warn",
        "no-dupe-class-members": "warn",
        "no-dupe-keys": "warn",
        "no-duplicate-case": "warn",
        "no-empty-character-class": "warn",
        "no-empty-pattern": "warn",
        "no-eval": "warn",
        "no-ex-assign": "warn",
        "no-extend-native": "warn",
        "no-extra-bind": "warn",
        "no-extra-label": "warn",
        "no-fallthrough": "warn",
        "no-func-assign": "warn",
        "no-implied-eval": "warn",
        "no-invalid-regexp": "warn",
        "no-iterator": "warn",
        "no-label-var": "warn",
        "no-labels": ["warn", { allowLoop: true, allowSwitch: false }],
        "no-lone-blocks": "warn",
        "no-loop-func": "warn",
        "no-mixed-operators": [
          "warn",
          {
            groups: [
              ["&", "|", "^", "~", "<<", ">>", ">>>"],
              ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
              ["&&", "||"],
              ["in", "instanceof"],
            ],
            allowSamePrecedence: false,
          },
        ],
        "no-multi-str": "warn",
        "no-global-assign": "warn",
        "no-unsafe-negation": "warn",
        "no-new-func": "warn",
        "no-new-object": "warn",
        "no-new-symbol": "warn",
        "no-new-wrappers": "warn",
        "no-obj-calls": "warn",
        "no-octal": "warn",
        "no-octal-escape": "warn",
        "no-redeclare": "warn",
        "no-regex-spaces": "warn",
        "no-restricted-syntax": ["warn", "WithStatement"],
        "no-script-url": "warn",
        "no-self-assign": "warn",
        "no-self-compare": "warn",
        "no-sequences": "warn",
        "no-shadow-restricted-names": "warn",
        "no-sparse-arrays": "warn",
        "no-template-curly-in-string": "warn",
        "no-this-before-super": "warn",
        "no-throw-literal": "warn",
        "no-restricted-globals": ["error"].concat(restrictedGlobals),
        "no-unreachable": "warn",
        "no-unused-expressions": [
          "error",
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        "no-unused-labels": "warn",
        "no-useless-computed-key": "warn",
        "no-useless-concat": "warn",
        "no-useless-constructor": "warn",
        "no-useless-escape": "warn",
        "no-useless-rename": [
          "warn",
          {
            ignoreDestructuring: false,
            ignoreImport: false,
            ignoreExport: false,
          },
        ],
        "no-with": "warn",
        "no-whitespace-before-property": "warn",
        "react-hooks/exhaustive-deps": "warn",
        "require-yield": "warn",
        "rest-spread-spacing": ["warn", "never"],
        strict: ["warn", "never"],
        "unicode-bom": ["warn", "never"],
        "use-isnan": "warn",
        "valid-typeof": "warn",
        "no-restricted-properties": [
          "error",
          {
            object: "require",
            property: "ensure",
            message:
              "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting",
          },
          {
            object: "System",
            property: "import",
            message:
              "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting",
          },
        ],
        "getter-return": "warn",

        // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
        "import/first": "error",
        "import/no-amd": "error",
        "import/no-anonymous-default-export": "warn",
        "import/no-webpack-loader-syntax": "error",

        // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
        "react/forbid-foreign-prop-types": ["warn", { allowInPropTypes: true }],
        "react/jsx-no-comment-textnodes": "warn",
        "react/jsx-no-duplicate-props": "warn",
        "react/jsx-no-target-blank": "warn",
        "react/jsx-no-undef": "error",
        "react/jsx-pascal-case": [
          "warn",
          {
            allowAllCaps: true,
            ignore: [],
          },
        ],
        "react/no-danger-with-children": "warn",
        // Disabled because of undesirable warnings
        // See https://github.com/facebook/create-react-app/issues/5204 for
        // blockers until its re-enabled
        // 'react/no-deprecated': 'warn',
        "react/no-direct-mutation-state": "warn",
        "react/no-is-mounted": "warn",
        "react/no-typos": "error",
        "react/require-render-return": "error",
        "react/style-prop-object": "warn",

        // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
        "jsx-a11y/alt-text": "warn",
        "jsx-a11y/anchor-has-content": "warn",
        "jsx-a11y/anchor-is-valid": [
          "warn",
          {
            aspects: ["noHref", "invalidHref"],
          },
        ],
        "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
        "jsx-a11y/aria-props": "warn",
        "jsx-a11y/aria-proptypes": "warn",
        "jsx-a11y/aria-role": ["warn", { ignoreNonDOM: true }],
        "jsx-a11y/aria-unsupported-elements": "warn",
        "jsx-a11y/heading-has-content": "warn",
        "jsx-a11y/iframe-has-title": "warn",
        "jsx-a11y/img-redundant-alt": "warn",
        "jsx-a11y/no-access-key": "warn",
        "jsx-a11y/no-distracting-elements": "warn",
        "jsx-a11y/no-redundant-roles": "warn",
        "jsx-a11y/role-has-required-aria-props": "warn",
        "jsx-a11y/role-supports-aria-props": "warn",
        "jsx-a11y/scope": "warn",

        // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
        "react-hooks/rules-of-hooks": "error",

        // https://github.com/gajus/eslint-plugin-flowtype
        "flowtype/define-flow-type": "warn",
        "flowtype/require-valid-file-annotation": "warn",
        "flowtype/use-flow-type": "warn",

        /* LS Rules */
        "import/no-anonymous-default-export": "off",
        "no-restricted-imports": [
          "error",
          {
            paths: [...constants.restrictedImportPaths],
          },
        ],
      },
    },
    {
      extends: ["plugin:testing-library/react"],
      files: ["**/tests/**/*.ts?(x)"],
      env: {
        "jest/globals": true,
      },
      // A subset of the recommended rules:
      rules: {
        // https://github.com/jest-community/eslint-plugin-jest
        "jest/no-conditional-expect": "error",
        "jest/no-identical-title": "error",
        "jest/no-interpolation-in-snapshots": "error",
        "jest/no-jasmine-globals": "error",
        "jest/no-mocks-import": "error",
        "jest/valid-describe-callback": "error",
        "jest/valid-expect": "error",
        "jest/valid-expect-in-promise": "error",
        "jest/valid-title": "warn",
      },
    },
  ],
};
