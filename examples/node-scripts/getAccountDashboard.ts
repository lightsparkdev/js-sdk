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
  )
);
client
  .getAccountDashboard(undefined, BitcoinNetwork.REGTEST)
  .then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
  });
