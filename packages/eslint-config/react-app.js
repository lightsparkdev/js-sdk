const baseRestrictedImportPaths =
  require("./react-lib/constants").restrictedImportPaths;

module.exports = {
  extends: ["./react-lib/config"],
  ignorePatterns: ["src/generated/", "storybook-static/"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          ...baseRestrictedImportPaths,
          {
            importNames: ["Link", "Navigate", "useNavigate"],
            message:
              "Please use typesafe imports from components/router instead.",
            name: "react-router-dom",
          },
          {
            importNames: ["Link", "Navigate", "useNavigate"],
            message:
              "Please use typesafe imports from components/router instead.",
            name: "@lightsparkdev/ui/router",
          },
          {
            importNames: ["default", "QRCodeSVG"],
            message:
              "Please use imports from @lightsparkdev/ui components instead.",
            name: "qrcode.react",
          },
          {
            importNames: [
              "Button",
              "ButtonProps",
              "ButtonRow",
              "ButtonRowContainer",
            ],
            message:
              "Please do not import typesafe route components directly, use bound versions from src/components/[COMPONENT] instead.",
            name: "@lightsparkdev/ui/components",
          },
          {
            importNames: [
              "CardFormTextWithLink",
              "Dropdown",
              "Table",
              "TableCell",
            ],
            message:
              "Please do not import typesafe route components directly, use bound versions from src/components/[COMPONENT] instead.",
            name: "@lightsparkdev/private-ui/src/components",
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
