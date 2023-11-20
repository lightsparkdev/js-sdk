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

module.exports = {
  restrictedImportPaths,
};
