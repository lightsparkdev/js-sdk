// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import { BitcoinNetwork } from "@lightsparkdev/lightspark-sdk";
import fs from "fs";

const BITCOIN_NETWORKS = [
  BitcoinNetwork.MAINNET,
  BitcoinNetwork.TESTNET,
  BitcoinNetwork.SIGNET,
  BitcoinNetwork.REGTEST,
];

export const isBitcoinNetwork = (bitcoinNetwork: BitcoinNetwork) => {
  return BITCOIN_NETWORKS.includes(bitcoinNetwork);
};

export const assertValidBitcoinNetwork = (
  bitcoinNetwork: BitcoinNetwork,
): void => {
  if (!isBitcoinNetwork(bitcoinNetwork)) {
    throw new Error(
      `Invalid bitcoin network ${bitcoinNetwork}. Valid networks: ${BITCOIN_NETWORKS}`,
    );
  }
};

export const getPackageVersion = (): string => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  return packageJson?.version;
};

export const getBitcoinNetworkOrThrow = (
  bitcoinNetwork: BitcoinNetwork,
): BitcoinNetwork => {
  assertValidBitcoinNetwork(bitcoinNetwork.toUpperCase() as BitcoinNetwork);
  return bitcoinNetwork;
};

export const getNodeId = async (
  client: LightsparkClient,
  bitcoinNetwork: BitcoinNetwork,
): Promise<string> => {
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }

  const entities = (await account.getNodes(client)).entities;
  const entityForNetwork = entities.find(
    (entity) => entity.bitcoinNetwork === bitcoinNetwork,
  );

  if (!entityForNetwork) {
    throw new Error(`Failed to find node on ${bitcoinNetwork}`);
  }

  return entityForNetwork.id;
};
