import { buildConfig } from "@lightsparkdev/vite";
import settings from "../settings.json";

export default buildConfig({
  port: process.env.SITE_PORT || settings.uiTestApp.port,
  dirname: __dirname,
  proxyTarget: process.env.VITE_PROXY_TARGET || undefined,
});
