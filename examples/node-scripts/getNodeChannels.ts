#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkClient } from "@lightsparkdev/js-sdk";
import { AccountTokenAuthProvider } from "@lightsparkdev/js-sdk/auth";
import { BitcoinNetwork } from "@lightsparkdev/js-sdk/objects";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const account = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(
    account.apiTokenClientId,
    account.apiTokenClientSecret
  ),
  account.baseUrl
);

const main = async () => {
  const currentAccount = await client.getCurrentAccount();
  console.log("Got account:", JSON.stringify(account, null, 2));

  const nodes = await currentAccount!.getNodes(client, 100, [
    BitcoinNetwork.REGTEST,
  ]);
  console.log("Got nodes:", JSON.stringify(nodes, null, 2));

  const channels = await nodes.entities[0].getChannels(client, 20);
  console.log("Got channels:", JSON.stringify(channels, null, 2));
};

main().catch((err) => console.error("Oh no, something went wrong.\n", err));
