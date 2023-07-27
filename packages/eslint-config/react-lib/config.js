const constants = require("./constants");

module.exports = {
  extends: ["../base", "react-app", "react-app/jest"],
  rules: {
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
