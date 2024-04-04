import { ComplianceProvider } from "@lightsparkdev/lightspark-sdk";

export default class UmaConfig {
  constructor(
    public readonly apiClientID: string,
    public readonly apiClientSecret: string,
    public readonly nodeID: string,
    public readonly umaEncryptionCertChain: string,
    public readonly umaEncryptionPubKeyHex: string,
    public readonly umaEncryptionPrivKeyHex: string,
    public readonly umaSigningCertChain: string,
    public readonly umaSigningPubKeyHex: string,
    public readonly umaSigningPrivKeyHex: string,
    public readonly clientBaseURL: string | undefined,
    public readonly oskSigningKeyPassword: string | undefined,
    public readonly remoteSigningMasterSeedHex: string | undefined,
    public readonly complianceProvider: ComplianceProvider | undefined,
    public readonly sendingVaspDomain: string | undefined,
  ) {}

  static fromEnvironment(): UmaConfig {
    const complianceProvider: ComplianceProvider | undefined =
      process.env.LIGHTSPARK_UMA_COMPLIANCE_PROVIDER &&
      process.env.LIGHTSPARK_UMA_COMPLIANCE_PROVIDER !== "" &&
      /* @ts-ignore */
      (ComplianceProvider[process.env.LIGHTSPARK_UMA_COMPLIANCE_PROVIDER] ??
        ComplianceProvider.FUTURE_VALUE);
    return new UmaConfig(
      requireEnv("LIGHTSPARK_API_TOKEN_CLIENT_ID"),
      requireEnv("LIGHTSPARK_API_TOKEN_CLIENT_SECRET"),
      requireEnv("LIGHTSPARK_UMA_NODE_ID"),
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN"),
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_PUBKEY"),
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_CERT_CHAIN"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_PUBKEY"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_PRIVKEY"),
      process.env.LIGHTSPARK_EXAMPLE_BASE_URL,
      process.env.LIGHTSPARK_UMA_OSK_NODE_SIGNING_KEY_PASSWORD,
      process.env.LIGHTSPARK_UMA_REMOTE_SIGNING_NODE_MASTER_SEED,
      complianceProvider,
      process.env.LIGHTSPARK_UMA_VASP_DOMAIN,
    );
  }

  umaEncryptionPubKey(): Uint8Array {
    return Buffer.from(this.umaEncryptionPubKeyHex, "hex");
  }

  umaEncryptionPrivKey(): Uint8Array {
    return Buffer.from(this.umaEncryptionPrivKeyHex, "hex");
  }

  umaSigningPubKey(): Uint8Array {
    return Buffer.from(this.umaSigningPubKeyHex, "hex");
  }

  umaSigningPrivKey(): Uint8Array {
    return Buffer.from(this.umaSigningPrivKeyHex, "hex");
  }

  remoteSigningMasterSeed(): Uint8Array | undefined {
    return this.remoteSigningMasterSeedHex &&
      this.remoteSigningMasterSeedHex.length > 0
      ? Buffer.from(this.remoteSigningMasterSeedHex, "hex")
      : undefined;
  }
}

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
};
