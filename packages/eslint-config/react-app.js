const reactAppRestrictedImports =
  require("./constants/react-restricted-imports").reactAppRestrictedImports;

module.exports = {
  extends: ["./react-lib"],
  ignorePatterns: ["src/generated/"],
  rules: {
    "no-restricted-imports": ["error", reactAppRestrictedImports],
  },
};
