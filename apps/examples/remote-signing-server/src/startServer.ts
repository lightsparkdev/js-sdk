import settings from "../../settings.json" assert { type: "json" };
import { app } from "./index.js";

app.listen(settings.remoteSigningServer.port, () => {
  console.log(
    `Server started on http://localhost:${settings.remoteSigningServer.port}`,
  );
});
