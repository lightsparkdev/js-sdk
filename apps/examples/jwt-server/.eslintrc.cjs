module.exports = {
  extends: ["@lightsparkdev/eslint-config/base", "google"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2],
    "max-len": ["error", { code: 120 }],
    "object-curly-spacing": ["error", "always"],
    "quote-props": ["off"],
  },
};
