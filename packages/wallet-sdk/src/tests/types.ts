import { type EnvCredentials } from "@lightsparkdev/wallet-cli/src/authHelpers.js";
import {
  type InvoiceData,
  type InvoiceType,
  type LightsparkClient,
} from "../index.js";

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

export type CreatedInvoiceData = Record<InvoiceType, InvoiceData | null>;

export type CreatedTestnetInvoiceData = Record<InvoiceType, string | null>;
