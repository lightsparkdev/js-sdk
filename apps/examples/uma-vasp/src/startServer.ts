import settings from "../../settings.json" assert { type: "json" };
import { app } from "./index.js";

const port = process.env.PORT || settings.umaVasp.port;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
