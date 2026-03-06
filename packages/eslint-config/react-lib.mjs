import globals from 'globals';
import restrictedGlobals from 'confusing-browser-globals';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';
import testingLibrary from 'eslint-plugin-testing-library';
import base from './base.mjs';

export default [
  ...base,
  {
    files: ['**/src/**/*.ts?(x)'],
    ignores: ['**/tests/**/*'],
    plugins: {
      react,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      jest: jestPlugin,
      'testing-library': testingLibrary,
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    rules: {
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',

      // http://eslint.org/docs/rules/
      'array-callback-return': 'warn',
      'dot-location': ['warn', 'property'],
      eqeqeq: ['warn', 'smart'],
      'new-parens': 'warn',
      'no-caller': 'warn',
      'no-cond-assign': ['warn', 'except-parens'],
      'no-const-assign': 'warn',
      'no-control-regex': 'warn',
      'no-delete-var': 'warn',
      'no-dupe-args': 'warn',
      'no-dupe-class-members': 'warn',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 'warn',
      'no-empty-character-class': 'warn',
      'no-empty-pattern': 'warn',
      'no-eval': 'warn',
      'no-ex-assign': 'warn',
      'no-extend-native': 'warn',
      'no-extra-bind': 'warn',
      'no-extra-label': 'warn',
      'no-fallthrough': 'warn',
      'no-func-assign': 'warn',
      'no-invalid-regexp': 'warn',
      'no-iterator': 'warn',
      'no-label-var': 'warn',
      'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
      'no-lone-blocks': 'warn',
      'no-loop-func': 'warn',
      'no-mixed-operators': [
        'warn',
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: false,
        },
      ],
      'no-multi-str': 'warn',
      'no-global-assign': 'warn',
      'no-unsafe-negation': 'warn',
      'no-new-func': 'warn',
      'no-new-object': 'warn',
      'no-new-symbol': 'warn',
      'no-new-wrappers': 'warn',
      'no-obj-calls': 'warn',
      'no-octal': 'warn',
      'no-octal-escape': 'warn',
      'no-redeclare': 'warn',
      'no-regex-spaces': 'warn',
      'no-restricted-syntax': ['warn', 'WithStatement'],
      'no-script-url': 'warn',
      'no-self-assign': 'warn',
      'no-self-compare': 'warn',
      'no-sequences': 'warn',
      'no-shadow-restricted-names': 'warn',
      'no-sparse-arrays': 'warn',
      'no-template-curly-in-string': 'warn',
      'no-this-before-super': 'warn',
      'no-restricted-globals': ['error'].concat(restrictedGlobals),
      'no-unreachable': 'warn',
      'no-unused-labels': 'warn',
      'no-useless-computed-key': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-rename': [
        'warn',
        {
          ignoreDestructuring: false,
          ignoreImport: false,
          ignoreExport: false,
        },
      ],
      'no-with': 'warn',
      'no-whitespace-before-property': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'require-yield': 'warn',
      'rest-spread-spacing': ['warn', 'never'],
      strict: ['warn', 'never'],
      'unicode-bom': ['warn', 'never'],
      'use-isnan': 'warn',
      'valid-typeof': 'warn',
      'no-restricted-properties': [
        'error',
        {
          object: 'require',
          property: 'ensure',
          message:
            'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
        {
          object: 'System',
          property: 'import',
          message:
            'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
      ],
      'getter-return': 'warn',

      // import plugin
      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-anonymous-default-export': 'warn',
      'import/no-webpack-loader-syntax': 'error',

      // react plugin
      'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
      'react/jsx-no-comment-textnodes': 'warn',
      'react/jsx-no-duplicate-props': 'warn',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': [
        'warn',
        { allowAllCaps: true, ignore: [] },
      ],
      'react/no-danger-with-children': 'warn',
      'react/no-direct-mutation-state': 'warn',
      'react/no-is-mounted': 'warn',
      'react/no-typos': 'error',
      'react/require-render-return': 'error',
      'react/style-prop-object': 'warn',

      // jsx-a11y plugin
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': [
        'warn',
        { aspects: ['noHref', 'invalidHref'] },
      ],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/iframe-has-title': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/no-distracting-elements': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/scope': 'warn',

      // react-hooks
      'react-hooks/rules-of-hooks': 'error',

    },
  },
  // Jest/testing-library rules for tests
  {
    files: ['**/tests/**/*.ts?(x)'],
    plugins: {
      jest: jestPlugin,
      'testing-library': testingLibrary,
    },
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      'jest/no-conditional-expect': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-interpolation-in-snapshots': 'error',
      'jest/no-jasmine-globals': 'error',
      'jest/no-mocks-import': 'error',
      'jest/valid-describe-callback': 'error',
      'jest/valid-expect': 'error',
      'jest/valid-expect-in-promise': 'error',
      'jest/valid-title': 'warn',
    },
  },
];
