#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  getCredentialsFromEnvOrThrow,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";

const account = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(
    account.apiTokenClientId,
    account.apiTokenClientSecret,
  ),
  account.baseUrl,
);
client
  .getAccountDashboard(undefined, BitcoinNetwork.REGTEST)
  .then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
  });
