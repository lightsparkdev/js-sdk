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
  },
  setupFiles: ["<rootDir>/jest/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest/setupAfterEnv.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transformIgnorePatterns: ["/node_modules/(?!lodash|nanoid|auto-bind)"],
};

export default config;
