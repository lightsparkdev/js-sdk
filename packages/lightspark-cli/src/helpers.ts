// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { input, rawlist } from "@inquirer/prompts";
import type { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import { BitcoinNetwork } from "@lightsparkdev/lightspark-sdk";
import fs from "fs";
import { Network } from "../lightspark_crypto/lightspark_crypto.js";

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

export const getNodeIds = async (
  client: LightsparkClient,
  bitcoinNetwork: BitcoinNetwork,
): Promise<string[]> => {
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }

  const entities = (await account.getNodes(client)).entities;
  const entitiesForNetwork = entities.filter(
    (entity) => entity.bitcoinNetwork === bitcoinNetwork,
  );

  if (!entitiesForNetwork.length) {
    throw new Error(`Failed to find any nodes on ${bitcoinNetwork}`);
  }

  return entitiesForNetwork.map((entity) => entity.id);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce((acc: string, byte: number) => {
    return (acc += ("0" + byte.toString(16)).slice(-2));
  }, "");
};

export const hexToBytes = (hex: string): Uint8Array => {
  const bytes: number[] = [];

  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return Uint8Array.from(bytes);
};

export const selectNodeId = async (nodeIds: string[]): Promise<string> => {
  if (nodeIds.length === 1) {
    return nodeIds[0];
  }

  console.log("Multiple nodes found.");
  const selectedNodeId = await rawlist({
    message: "Select a node to use:",
    choices: nodeIds.map((nodeId) => ({ value: nodeId })),
  });

  return selectedNodeId;
};

export const inputRemoteSigningSeedHex = async (): Promise<string> => {
  return await input({
    message: "Provide your hex-encoded, remote-signing seed:",
    validate: (value) => value.length > 0,
  });
};

export const getCryptoLibNetwork = (
  bitcoinNetwork: BitcoinNetwork,
): Network => {
  switch (bitcoinNetwork) {
    case BitcoinNetwork.MAINNET:
      return Network.Bitcoin;
    case BitcoinNetwork.TESTNET:
      return Network.Testnet;
    case BitcoinNetwork.REGTEST:
      return Network.Regtest;
    default:
      throw new Error(
        `Unsupported lightspark_crypto network ${bitcoinNetwork}.`,
      );
  }
};
