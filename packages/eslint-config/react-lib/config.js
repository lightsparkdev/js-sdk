const constants = require("./constants");

module.exports = {
  extends: ["../base", "../cra", "../cra-jest"],

  rules: {
    /* LS Rules */
    "import/no-anonymous-default-export": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [...constants.restrictedImportPaths],
      },
    ],
  },
};
