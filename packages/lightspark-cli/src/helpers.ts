// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { input, rawlist } from "@inquirer/prompts";
import { Network } from "@lightsparkdev/crypto-wasm";
import type { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import { BitcoinNetwork } from "@lightsparkdev/lightspark-sdk";
import fs from "fs";

const BITCOIN_NETWORKS = [
  BitcoinNetwork.MAINNET,
  BitcoinNetwork.TESTNET,
  BitcoinNetwork.SIGNET,
  BitcoinNetwork.REGTEST,
];

interface NodeInfo {
  id: string;
  bitcoinNetwork: BitcoinNetwork;
}

export const getPackageVersion = (): string => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  return packageJson?.version;
};

export const getNodeIds = async (
  client: LightsparkClient,
  bitcoinNetwork?: BitcoinNetwork,
): Promise<NodeInfo[]> => {
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }

  let entities = (await account.getNodes(client)).entities;
  if (bitcoinNetwork) {
    entities = entities.filter(
      (entity) => entity.bitcoinNetwork === bitcoinNetwork,
    );
  }

  if (!entities.length) {
    throw new Error(`Failed to find any nodes`);
  }

  return entities.map((entity) => ({
    id: entity.id,
    bitcoinNetwork: entity.bitcoinNetwork,
  }));
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

export const selectNodeId = async (
  nodeInfos: NodeInfo[],
): Promise<NodeInfo> => {
  if (nodeInfos.length === 1) {
    return nodeInfos[0];
  }

  console.log("Multiple nodes found.");
  const selectedNode = await rawlist({
    message: "Select a node to use:",
    choices: nodeInfos.map(({ id, bitcoinNetwork }) => ({
      name: `${id} (${bitcoinNetwork})`,
      value: { id, bitcoinNetwork } as NodeInfo,
    })),
  });

  return selectedNode;
};

export const inputRemoteSigningSeedHex = async (): Promise<string> => {
  return await input({
    message: "Provide your hex-encoded, remote-signing seed:",
    validate: (value) => value.length > 0,
  });
};

export const inputBitcoinNetwork = async (): Promise<BitcoinNetwork> => {
  return await rawlist({
    message: "Select a bitcoin network:",
    choices: BITCOIN_NETWORKS.map((network) => ({ value: network })),
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
