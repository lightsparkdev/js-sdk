#!/usr/bin/env ts-node

import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { AccountTokenAuthProvider } from "@lightspark/js-sdk/auth";
import { BitcoinNetwork } from "@lightspark/js-sdk/generated/graphql";
import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";


const account = getCredentialsFromEnvOrThrow();
const client = new LightsparkWalletClient(new AccountTokenAuthProvider(account.clientId, account.clientSecret), account.walletNodeId);
client.getWalletDashboard(BitcoinNetwork.Regtest).then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
});
