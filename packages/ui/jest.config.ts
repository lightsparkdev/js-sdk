import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig-test.json",
        useESM: true,
        babelConfig: {
          plugins: ["@emotion/babel-plugin"],
        },
      },
    ],
  },
  resetMocks: true,
  /* Sometimes turbo slows down test execution across many tasks: */
  testTimeout: 20000,
  moduleNameMapper: {
    "^.+\\.(css|svg|png)$": "identity-obj-proxy",
    /* ts-jest doesn't support .js imports which are required for making imports work in
       the published ui package. See issue https://bit.ly/3TF1uSS. Also appears to rewrite
       files in node_modules which can lead to weird resolution errors. Use with caution */
    "(.+)\\.js": "$1",
  },
  setupFiles: ["<rootDir>/jest/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest/setupAfterEnv.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transformIgnorePatterns: ["/node_modules/(?!lodash|nanoid|auto-bind)"],
};

export default config;
