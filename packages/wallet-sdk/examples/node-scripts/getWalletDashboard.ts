#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  LightsparkClient,
  CustomJwtAuthProvider,
  InMemoryJwtStorage,
} from "@lightsparkdev/wallet-sdk";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const account = getCredentialsFromEnvOrThrow();
const storage = new InMemoryJwtStorage();
const authProvider = new CustomJwtAuthProvider(new InMemoryJwtStorage());
const client = new LightsparkClient(
  authProvider,
  account.baseUrl
);
await client.loginWithJWT(account.accountId, account.jwt, storage);
client
  .getWalletDashboard()
  .then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
  });
