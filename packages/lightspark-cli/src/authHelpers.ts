// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { BitcoinNetwork } from "@lightsparkdev/lightspark-sdk";
import dotenv from "dotenv";
import { getBitcoinNetworkOrThrow } from "./helpers.js";

export type EnvCredentials = {
  apiTokenClientId: string;
  apiTokenClientSecret: string;
  bitcoinNetwork: BitcoinNetwork;
  testNodePassword: string;
  baseUrl: string;
};

enum RequiredTestCredentials {
  ClientId = "LIGHTSPARK_API_TOKEN_CLIENT_ID",
  ClientSecret = "LIGHTSPARK_API_TOKEN_CLIENT_SECRET",
  BitcoinNetwork = "BITCOIN_NETWORK",
}

export const getCredentialsFromEnvOrThrow = (): EnvCredentials => {
  dotenv.config({ path: process.env.HOME + "/.lightsparkapienv" });

  const missingTestCredentials = Object.values(RequiredTestCredentials).filter(
    (cred) => !process.env[cred]
  );
  if (missingTestCredentials.length) {
    throw new Error(
      `Missing test credentials. Please set ${missingTestCredentials.join(
        ", "
      )} environment variables.`
    );
  }

  const apiTokenClientId = process.env[RequiredTestCredentials.ClientId]!;
  const apiTokenClientSecret =
    process.env[RequiredTestCredentials.ClientSecret]!;
  const bitcoinNetwork = getBitcoinNetworkOrThrow(
    process.env[RequiredTestCredentials.BitcoinNetwork]! as BitcoinNetwork
  );
  const testNodePassword = "1234!@#$";
  const baseUrl =
    process.env["LIGHTSPARK_EXAMPLE_BASE_URL"] || "api.lightspark.com";
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    bitcoinNetwork,
    testNodePassword,
    baseUrl,
  };
};
