// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { BitcoinNetwork } from "./objects/BitcoinNetwork.js";

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
      `Invalid bitcoin network ${bitcoinNetwork}. Valid networks: ${BITCOIN_NETWORKS.join(
        ", ",
      )}`,
    );
  }
};

export const getBitcoinNetworkOrThrow = (
  bitcoinNetwork: BitcoinNetwork,
): BitcoinNetwork => {
  assertValidBitcoinNetwork(bitcoinNetwork.toUpperCase() as BitcoinNetwork);
  return bitcoinNetwork;
};
