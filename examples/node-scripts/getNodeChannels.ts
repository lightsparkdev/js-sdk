#!/usr/bin/env ts-node
import { LightsparkClient } from "@lightsparkdev/js-sdk";
import { AccountTokenAuthProvider } from "@lightsparkdev/js-sdk/auth";
import { BitcoinNetwork } from "@lightsparkdev/js-sdk/objects";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const account = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(account.clientId, account.clientSecret)
);

const main = async () => {
  const currentAccount = await client.getCurrentAccount();
  console.log("Got account:", JSON.stringify(account, null, 2));

  const nodes = await currentAccount!.getNodes(client.requester, 100, [
    BitcoinNetwork.REGTEST,
  ]);
  console.log("Got nodes:", JSON.stringify(nodes, null, 2));

  const channels = await nodes.entities[0].getChannels(client.requester, 20);
  console.log("Got channels:", JSON.stringify(channels, null, 2));
};

main().catch((err) => console.error("Oh no, something went wrong.\n", err));
