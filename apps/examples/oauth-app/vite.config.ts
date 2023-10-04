import { buildConfig } from "@lightsparkdev/vite";
import settings from "../settings.json";

export default buildConfig({
  port: settings.oauthApp.port,
  dirname: __dirname,
});
