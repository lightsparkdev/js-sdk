import { type EnvCredentials } from "@lightsparkdev/wallet-cli/src/authHelpers.js";
import type LightsparkClient from "../../client.js";

export type CredentialsFromEnv = {
  accountId: string;
  jwt: string;
  pubKey?: string;
  privKey?: string;
  baseUrl: string;
  jwtSigningPrivateKey?: string;
};

export type CredentialsForWalletJWTCreating = {
  client: LightsparkClient;
  options: OptionsForWalletJWTCreating;
  credentials?: EnvCredentials;
};

export type OptionsForWalletJWTCreating = {
  userId: string;
  test: boolean;
};

export type SerializedKeyPair =
  | { privateKey: string; publicKey: string }
  | undefined;
