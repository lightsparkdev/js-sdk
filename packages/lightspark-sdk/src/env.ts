// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/* 
 * These utils are only needed in NodeJS contexts and so the file is exported
 * separately
   in the package to avoid eg unnecessary browser bundling */
import dotenv from "dotenv";
import { getBitcoinNetworkOrThrow } from "./helpers.js";
import { type BitcoinNetwork } from "./objects/BitcoinNetwork.js";

export type EnvCredentials = {
  apiTokenClientId: string;
  apiTokenClientSecret: string;
  bitcoinNetwork: BitcoinNetwork;
  testNodePassword: string;
  baseUrl: string;
};

export enum RequiredCredentials {
  ClientId = "LIGHTSPARK_API_TOKEN_CLIENT_ID",
  ClientSecret = "LIGHTSPARK_API_TOKEN_CLIENT_SECRET",
  BitcoinNetwork = "BITCOIN_NETWORK",
}

export const getCredentialsFromEnvOrThrow = (): EnvCredentials => {
  const env =
    dotenv.config({
      path: process.env.HOME + "/.lightsparkapienv",
    }).parsed || {};

  const missingTestCredentials = Object.values(RequiredCredentials).filter(
    (cred) => !env[cred],
  );
  if (missingTestCredentials.length) {
    throw new Error(
      `Missing test credentials. Please set ${missingTestCredentials.join(
        ", ",
      )} environment variables.`,
    );
  }

  const apiTokenClientId = env[RequiredCredentials.ClientId];
  const apiTokenClientSecret = env[RequiredCredentials.ClientSecret];
  const bitcoinNetwork = getBitcoinNetworkOrThrow(
    env[RequiredCredentials.BitcoinNetwork] as BitcoinNetwork,
  );
  const testNodePassword = "1234!@#$";
  const baseUrl = env["LIGHTSPARK_BASE_URL"] || "api.lightspark.com";
  return {
    apiTokenClientId,
    apiTokenClientSecret,
    bitcoinNetwork,
    testNodePassword,
    baseUrl,
  };
};
