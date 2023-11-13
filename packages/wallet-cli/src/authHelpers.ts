// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import dotenv from "dotenv";

export type EnvCredentials = {
  accountId: string;
  jwt: string;
  pubKey?: string;
  privKey?: string;
  baseUrl: string;
  jwtSigningPrivateKey?: string;
};

export enum RequiredCredentials {
  AccountId = "LIGHTSPARK_ACCOUNT_ID",
  JwtPrivateKey = "LIGHTSPARK_JWT_PRIV_KEY",
}

export enum RequiredWalletCredentials {
  Jwt = "LIGHTSPARK_JWT",
  WalletPublicKey = "LIGHTSPARK_WALLET_PUB_KEY",
  WalletPrivateKey = "LIGHTSPARK_WALLET_PRIV_KEY",
}

export const getCredentialsFromEnvOrThrow = (
  walletEnvSuffix: string = ``,
  requireJwt: boolean = true,
): EnvCredentials => {
  const env =
    dotenv.config({
      path: process.env.HOME + "/.lightsparkenv",
    }).parsed || {};

  const missingCredentials = Object.values(RequiredCredentials).filter(
    (cred) => !env[cred],
  );
  if (missingCredentials.length) {
    throw new Error(
      `Missing credentials. Please set ${missingCredentials.join(
        ", ",
      )} environment variables or run \`lightspark-wallet init-env\`.`,
    );
  }

  const accountId = env[RequiredCredentials.AccountId];
  const jwtSigningPrivateKey = env[RequiredCredentials.JwtPrivateKey];

  if (requireJwt) {
    const missingWalletCredentials = Object.values(
      RequiredWalletCredentials,
    ).filter((cred) => !env[getWalletEnvVariable(cred, walletEnvSuffix)]);

    if (missingWalletCredentials.length) {
      throw new Error(
        `Missing wallet credentials. Please set ${missingWalletCredentials
          .map((cred) => getWalletEnvVariable(cred, walletEnvSuffix))
          .join(
            ", ",
          )} environment variables or run \`lightspark-wallet create-and-init-wallet\` to setup a new wallet.`,
      );
    }
  }

  const jwt =
    env[getWalletEnvVariable(RequiredWalletCredentials.Jwt, walletEnvSuffix)];
  const pubKey =
    env[
      getWalletEnvVariable(
        RequiredWalletCredentials.WalletPublicKey,
        walletEnvSuffix,
      )
    ];
  const privKey =
    env[
      getWalletEnvVariable(
        RequiredWalletCredentials.WalletPrivateKey,
        walletEnvSuffix,
      )
    ];
  const baseUrl = env[`LIGHTSPARK_WALLET_BASE_URL`] || `api.lightspark.com`;
  return {
    accountId,
    jwt: jwt || "",
    pubKey,
    privKey,
    baseUrl,
    jwtSigningPrivateKey,
  };
};

const getWalletEnvVariable = (
  walletEnvKey: string,
  walletEnvSuffix: string,
) => {
  return `${walletEnvKey}${walletEnvSuffix}`;
};
