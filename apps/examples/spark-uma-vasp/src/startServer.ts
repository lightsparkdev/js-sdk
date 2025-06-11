import { SparkWallet } from "@buildonspark/spark-sdk";
import { InMemoryNonceValidator, InMemoryPublicKeyCache } from "@uma-sdk/core";
import UmaConfig from "./UmaConfig.js";
import DemoUserService from "./demo/DemoUserService.js";
import InMemorySendingVaspRequestCache from "./demo/InMemorySendingVaspRequestCache.js";
import { createUmaServer } from "./server.js";

// In a real implementation, you'd replace the demo implementations of all of the services with your
// own when constructing the server.
const config = UmaConfig.fromEnvironment();
const userService = new DemoUserService();

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
SparkWallet.initialize({
  options: {
    network: config.sparkWalletNetwork || "REGTEST", // Change to "MAINNET" or "TESTNET" as needed
  },
}).then(({ mnemonic, wallet: sparkWallet }) => {
  const umaServer = createUmaServer(
    config,
    sparkWallet as SparkWallet, // Something is wonky with the types here, but this works in practice.
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
});
