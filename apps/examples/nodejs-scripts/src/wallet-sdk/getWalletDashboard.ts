#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  CustomJwtAuthProvider,
  InMemoryTokenStorage,
  LightsparkClient,
} from "@lightsparkdev/wallet-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/wallet-sdk/env";

const account = getCredentialsFromEnvOrThrow();
const storage = new InMemoryTokenStorage();
const authProvider = new CustomJwtAuthProvider(new InMemoryTokenStorage());
const client = new LightsparkClient(authProvider, account.baseUrl);
await client.loginWithJWT(account.accountId, account.jwt, storage);
client
  .getWalletDashboard()
  .then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
  })
  .catch((error) => {
    console.error("Error fetching dashboard:", error);
  });
