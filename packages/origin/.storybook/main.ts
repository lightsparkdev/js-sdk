import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  viteFinal: async (viteConfig, { configType }) =>
    mergeConfig(viteConfig, {
      define: {
        "process.env.NODE_ENV": JSON.stringify(
          configType === "PRODUCTION" ? "production" : "development",
        ),
      },
      resolve: {
        alias: {
          "@": path.resolve(dirname, "../src"),
        },
      },
    }),
};

export default config;
