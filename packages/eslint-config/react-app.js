const baseRestrictedImportPaths =
  require("./constants/react-restricted-imports").restrictedImportPaths;

module.exports = {
  extends: ["./react-lib"],
  ignorePatterns: ["src/generated/"],
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
            importNames: [
              "Link",
              "Navigate",
              "useNavigate",
              "useMatchRoutes",
              "useFindMatchingRoute",
              "useMatchRoute",
              "useCurrentRoute",
              "getRouteName",
            ],
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
            importNames: ["useWhatChanged"],
            message: "This is for use in local development only.",
            name: "@lightsparkdev/ui/hooks/useWhatChanged",
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
          {
            group: [
              "@lightsparkdev/ui",
              "@lightsparkdev/ui/**",
              "@lightsparkdev/private-ui",
              "@lightsparkdev/private-ui/**",
            ],
            importNames: [
              "Button",
              "ButtonProps",
              "ButtonRow",
              "ButtonRowContainer",
              "CardForm",
              "CardFormTextWithLink",
              "Dropdown",
              "Table",
              "TableCell",
              "TextButton",
            ],
            message:
              "Please do not import typesafe route components directly, use bound versions from src/components/[COMPONENT] instead.",
          },
        ],
      },
    ],
  },
};
