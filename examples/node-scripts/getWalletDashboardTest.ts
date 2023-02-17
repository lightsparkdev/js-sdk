#!/usr/bin/env ts-node

import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { AccountTokenAuthProvider } from "@lightspark/js-sdk/auth";
import { BitcoinNetwork } from "@lightspark/js-sdk/generated/graphql";


const TEST_ACCOUNT = {
  clientId: "0185c15936bf4f89000019ac0f816213",
  clientSecret: "pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs",
};
const TEST_VIEWER_WALLET_ID =
  "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599";
const TEST_CREATOR_WALLET_ID =
  "LightsparkNode:0185c3fb-da63-f96b-0000-dde38238b1b3";
const TEST_CREDS = {
  clientId: TEST_ACCOUNT.clientId,
  clientSecret: TEST_ACCOUNT.clientSecret,
  creatorWalletId: TEST_CREATOR_WALLET_ID,
  viewerWalletId: TEST_VIEWER_WALLET_ID,
};

const client = new LightsparkWalletClient(new AccountTokenAuthProvider(TEST_ACCOUNT.clientId, TEST_ACCOUNT.clientSecret), TEST_VIEWER_WALLET_ID);
client.getWalletDashboard(BitcoinNetwork.Regtest).then((dashboard) => {
    console.log("Got dashboard:", JSON.stringify(dashboard, null, 2));
});
