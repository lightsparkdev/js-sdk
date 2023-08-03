const baseRestrictedImportPaths =
  require("./react-lib/constants").restrictedImportPaths;

module.exports = {
  extends: ["./react-lib/config"],
  ignorePatterns: ["src/generated/graphql.tsx", "storybook-static"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          ...baseRestrictedImportPaths,
          {
            importNames: ["Link", "Navigate", "useNavigate"],
            message: "Please use typesafe imports from common/router instead.",
            name: "react-router-dom",
          },
          {
            importNames: ["default", "QRCodeSVG"],
            message:
              "Please use imports from @lightsparkdev/ui components instead.",
            name: "qrcode.react",
          },
          {
            importNames: ["Button", "ButtonProps"],
            message:
              "Please do not import Button directly, use typesafe Button in common/Button instead.",
            name: "@lightsparkdev/ui/components",
          },
          {
            importNames: ["useWhatChanged"],
            message: "This is for use in local development only.",
            name: "@lightsparkdev/private-ui/src/hooks/useWhatChanged",
          },
        ],
        patterns: [
          {
            group: [
              "**/services/**/service",
              "!**/services/Services",
              "!**/services/**/types",
              "!**/services/**/constants",
            ],
            message:
              "Please do not import services directly, use Services class to access.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/__tests__/**/*", "cypress/**/*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },
  ],
};
