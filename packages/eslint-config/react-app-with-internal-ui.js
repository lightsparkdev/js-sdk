const reactAppRestrictedImports =
  require("./constants/react-restricted-imports").reactAppRestrictedImports;

module.exports = {
  extends: ["./react-app"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        ...reactAppRestrictedImports,
        patterns: [
          ...reactAppRestrictedImports.patterns,
          {
            group: [
              "@lightsparkdev/ui/**",
              "!@lightsparkdev/ui/src",
              "!@lightsparkdev/ui/src/**",
            ],
            message:
              "This app can import directly from @lightsparkdev/ui/src to avoid requiring a build.",
          },
        ],
      },
    ],
  },
};
