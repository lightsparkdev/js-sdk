import fs from "fs";
import jwt from "jsonwebtoken";

import { b64encode, DefaultCrypto } from "@lightsparkdev/core";
import { type EnvCredentials } from "@lightsparkdev/wallet-cli/src/authHelpers.js";

import type LightsparkClient from "../../client.js";
import WalletStatus from "../../objects/WalletStatus.js";

import { InMemoryTokenStorage } from "../../index.js";
import { MINUTES_IN_HOUR, MS_IN_SECOND } from "../constants.js";
import {
  type CredentialsForWalletJWTCreating,
  type OptionsForWalletJWTCreating,
  type SerializedKeyPair,
} from "../types.js";
import { sleep } from "./time.helpers.js";

const WALLET_STATUS_INTERVAL = 30_000;

const HOURS_BEFORE_EXPIRE = 5;

export const genKeyForWallet = async (
  walletStatus?: WalletStatus,
): Promise<SerializedKeyPair | undefined> => {
  if (!walletStatus) throw new Error("Wallet status is undefined");

  if (
    walletStatus !== WalletStatus.DEPLOYED &&
    walletStatus !== WalletStatus.READY
  )
    return;

  const generatedKeypair = await DefaultCrypto.generateSigningKeyPair();

  return {
    privateKey: b64encode(
      await DefaultCrypto.serializeSigningKey(
        generatedKeypair.privateKey,
        "pkcs8",
      ),
    ),
    publicKey: b64encode(
      await DefaultCrypto.serializeSigningKey(
        generatedKeypair.publicKey,
        "spki",
      ),
    ),
  };
};

export const getClaimsByType = (
  type: "regtest" | "testnet" | "mainnet",
  opts: {
    userId: string;
    isTest: boolean;
  },
) =>
  ({
    regtest: {
      aud: "https://api.lightspark.com",
      sub: opts.userId,
      test: true,
      iat: Math.floor(Date.now() / MS_IN_SECOND),
      exp: Math.floor(
        Date.now() / MS_IN_SECOND + MINUTES_IN_HOUR * HOURS_BEFORE_EXPIRE,
      ),
    },
    testnet: {
      aud: "https://api.lightspark.com",
      sub: opts.userId,
      test: false,
      iat: Math.floor(Date.now() / MS_IN_SECOND),
      exp: Math.floor(
        Date.now() / MS_IN_SECOND + MINUTES_IN_HOUR * HOURS_BEFORE_EXPIRE,
      ),
      bitcoin_network: "testnet",
    },
    mainnet: {
      aud: "https://api.lightspark.com",
      sub: opts.userId,
      test: false,
      iat: Math.floor(Date.now() / MS_IN_SECOND),
      exp: Math.floor(
        Date.now() / MS_IN_SECOND + MINUTES_IN_HOUR * HOURS_BEFORE_EXPIRE,
      ),
    },
  })[type];

export const createWalletJwt = (
  createCredentials: CredentialsForWalletJWTCreating,
) => {
  const { options, credentials } = createCredentials;

  if (!options) throw new Error("Options not found");

  const { userId, test } = options;

  const privateKey = credentials?.jwtSigningPrivateKey;

  if (!privateKey) {
    throw new Error(
      "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY.",
    );
  }

  const claims = {
    aud: "https://api.lightspark.com",
    sub: userId,
    test: options.test,
    iat: Math.floor(Date.now() / MS_IN_SECOND),
    exp: Math.floor(
      Date.now() / MS_IN_SECOND + MINUTES_IN_HOUR * HOURS_BEFORE_EXPIRE,
    ),
  };

  const token = jwt.sign(claims, privateKey, { algorithm: "ES256" });

  return { token, userId, test };
};

export const deployWallet = async (
  client: LightsparkClient,
  options: OptionsForWalletJWTCreating,
  credentials?: EnvCredentials,
) => {
  if (!credentials) {
    throw new Error("Credentials not found in environment.");
  }

  const { token, userId, test } = createWalletJwt({
    client,
    options,
    credentials,
  });

  if (!credentials) throw new Error("Credentials not found");

  const loginOutput = await client.loginWithJWT(
    credentials.accountId,
    token,
    new InMemoryTokenStorage(),
  );

  let walletStatus = loginOutput.wallet.status;

  if (loginOutput.wallet.status === WalletStatus.NOT_SETUP) {
    walletStatus = await client.deployWalletAndAwaitDeployed();
  }

  let currentWallet = await client.getCurrentWallet();
  while (
    walletStatus === WalletStatus.INITIALIZING ||
    walletStatus === WalletStatus.DEPLOYING
  ) {
    await sleep(WALLET_STATUS_INTERVAL);

    currentWallet = await client.getCurrentWallet();

    if (currentWallet) {
      walletStatus = currentWallet.status;
    }
  }

  if (!currentWallet) {
    throw new Error("currentWallet is null");
  }

  const serializedKeypair = await genKeyForWallet(walletStatus);

  if (
    walletStatus !== WalletStatus.DEPLOYED &&
    walletStatus !== WalletStatus.READY
  ) {
    console.error(
      `Not initialized because the wallet status is ${loginOutput.wallet.status}`,
    );
  }

  let content = `\n# Wallet for user ${userId}:\n# accountID: ${credentials.accountId}\n# test: ${test}\n`;

  content += `export LIGHTSPARK_JWT_${userId}="${token}"\n`;
  if (serializedKeypair) {
    content += `export LIGHTSPARK_WALLET_PRIV_KEY_${userId}="${serializedKeypair?.privateKey}"\n`;
    content += `export LIGHTSPARK_WALLET_PUB_KEY_${userId}="${serializedKeypair?.publicKey}"\n`;

    fs.appendFile("./test.logs", content, () => null);

    process.env = {
      ...process.env,
      [`LIGHTSPARK_JWT_${userId}`]: token,
      [`LIGHTSPARK_WALLET_PRIV_KEY_${userId}`]: serializedKeypair?.privateKey,
      [`LIGHTSPARK_WALLET_PUB_KEY_${userId}`]: serializedKeypair?.publicKey,
    };
  }

  return {
    userId,
    walletId: currentWallet.id,
    jwt: token,
    pubKey: serializedKeypair?.publicKey,
    privKey: serializedKeypair?.privateKey,
  };
};
