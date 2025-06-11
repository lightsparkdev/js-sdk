export default class UmaConfig {
  constructor(
    public readonly umaEncryptionCertChain: string,
    public readonly umaEncryptionPubKeyHex: string,
    public readonly umaEncryptionPrivKeyHex: string,
    public readonly umaSigningCertChain: string,
    public readonly umaSigningPubKeyHex: string,
    public readonly umaSigningPrivKeyHex: string,
    public readonly sparkWalletNetwork:
      | "MAINNET"
      | "TESTNET"
      | "REGTEST"
      | "LOCAL"
      | undefined,
    public readonly sendingVaspDomain: string | undefined,
  ) {}

  static fromEnvironment(): UmaConfig {
    const network =
      process.env.LIGHTSPARK_SPARK_WALLET_NETWORK?.toLocaleUpperCase();
    if (
      network &&
      network !== "MAINNET" &&
      network !== "TESTNET" &&
      network !== "REGTEST" &&
      network !== "LOCAL"
    ) {
      throw new Error(
        `Invalid LIGHTSPARK_SPARK_WALLET_NETWORK environment variable: ${network}. Expected one of MAINNET, TESTNET, REGTEST, or LOCAL.`,
      );
    }

    return new UmaConfig(
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN"),
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_PUBKEY"),
      requireEnv("LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_CERT_CHAIN"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_PUBKEY"),
      requireEnv("LIGHTSPARK_UMA_SIGNING_PRIVKEY"),
      network as "MAINNET" | "TESTNET" | "REGTEST" | "LOCAL" | undefined,
      process.env.LIGHTSPARK_UMA_VASP_DOMAIN,
    );
  }

  umaEncryptionPubKey(): Uint8Array {
    const buffer = Buffer.from(this.umaEncryptionPubKeyHex, "hex");
    return new Uint8Array(buffer);
  }

  umaEncryptionPrivKey(): Uint8Array {
    const buffer = Buffer.from(this.umaEncryptionPrivKeyHex, "hex");
    return new Uint8Array(buffer);
  }

  umaSigningPubKey(): Uint8Array {
    const buffer = Buffer.from(this.umaSigningPubKeyHex, "hex");
    return new Uint8Array(buffer);
  }

  umaSigningPrivKey(): Uint8Array {
    const buffer = Buffer.from(this.umaSigningPrivKeyHex, "hex");
    return new Uint8Array(buffer);
  }
}

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
};
