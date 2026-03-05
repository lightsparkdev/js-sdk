import { createRequire } from "node:module";
import { app } from "./index.js";

const require = createRequire(import.meta.url);
const settings = require("../../settings.json");

app.listen(settings.remoteSigningServer.port, () => {
  console.log(
    `Server started on http://localhost:${settings.remoteSigningServer.port}`,
  );
});
