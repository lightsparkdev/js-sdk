import { buildConfig } from "@lightsparkdev/vite";
import settings from "../settings.json";

export default buildConfig({
  port: settings.reactWalletApp.port,
  dirname: __dirname,
});
