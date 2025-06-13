import { InMemoryNonceValidator, InMemoryPublicKeyCache } from "@uma-sdk/core";
import UmaConfig from "./UmaConfig.js";
import InMemorySendingVaspRequestCache from "./demo/InMemorySendingVaspRequestCache.js";
import SparkAddressUserService from "./demo/SparkAddressService.js";
import { createUmaServer } from "./server.js";

// In a real implementation, you'd replace the demo implementations of all of the services with your
// own when constructing the server.
const config = UmaConfig.fromEnvironment();
const userService = new SparkAddressUserService();

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const umaServer = createUmaServer(
  config,
  new InMemoryPublicKeyCache(),
  new InMemorySendingVaspRequestCache(),
  userService,
  new InMemoryNonceValidator(twoDaysAgo.getTime()),
);

let port = 8080;
if (process.env.PORT) {
  port = parseInt(process.env.PORT);
}
umaServer.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
