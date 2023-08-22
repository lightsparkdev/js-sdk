import dotenv from "dotenv";
import { type CredentialsFromEnv } from "../types/index.js";

dotenv.populate(process.env, { path: process.env.HOME + "/.lightsparkenv" });

const DEFAULT_BASE_URL = "api.lightspark.com";

export const getCredentialsFromEnvOrThrow = (): CredentialsFromEnv => {
  const accountId = process.env[`LIGHTSPARK_ACCOUNT_ID`];
  const jwtSigningPrivateKey = process.env[`LIGHTSPARK_JWT_PRIV_KEY`];

  const baseUrl =
    process.env[`LIGHTSPARK_EXAMPLE_BASE_URL`] || DEFAULT_BASE_URL;

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
