const restrictedImportPaths = [
  {
    importNames: ["isApolloError"],
    message: "Please use the import from utils/errors instead.",
    name: "@apollo/client",
  },
  {
    importNames: ["useWhatChanged"],
    message: "This is for use in local development only.",
    name: "@simbathesailor/use-what-changed",
  },
];

const reactAppRestrictedImports = {
  paths: [
    ...restrictedImportPaths,
    {
      importNames: ["Link", "Navigate", "useNavigate"],
      message:
        "Please use typesafe imports from @lightsparkdev/ui/router instead.",
      name: "react-router-dom",
    },
    {
      importNames: ["default", "QRCodeSVG"],
      message: "Please use imports from @lightsparkdev/ui components instead.",
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
  ],
};

module.exports = {
  restrictedImportPaths,
  reactAppRestrictedImports,
};
