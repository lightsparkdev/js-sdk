import dotenv, { type DotenvPopulateInput } from "dotenv";
import { DEFAULT_BASE_URL } from "../constants.js";
import { type CredentialsFromEnv } from "../types.js";

const { parsed } = dotenv.config({
  path: process.env.HOME + "/.lightsparkenv",
});

if (parsed) {
  dotenv.populate(process.env as DotenvPopulateInput, parsed);
}

export const getCredentialsFromEnvOrThrow = (): CredentialsFromEnv => {
  const accountId = process.env[`LIGHTSPARK_ACCOUNT_ID`];
  const jwtSigningPrivateKey = process.env[`LIGHTSPARK_JWT_PRIV_KEY`];

  const baseUrl = process.env[`LIGHTSPARK_WALLET_BASE_URL`] || DEFAULT_BASE_URL;

  if (!accountId || !jwtSigningPrivateKey) {
    throw new Error(
      `Missing test credentials. Please set LIGHTSPARK_ACCOUNT_ID and LIGHTSPARK_JWT_PRIV_KEY.`,
    );
  }

  return {
    accountId,
    jwt: "",
    pubKey: "",
    privKey: "",
    baseUrl,
    jwtSigningPrivateKey,
  };
};
