export default class UmaConfig {
  constructor(
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
      network as "MAINNET" | "TESTNET" | "REGTEST" | "LOCAL" | undefined,
      process.env.LIGHTSPARK_UMA_VASP_DOMAIN,
    );
  }
}

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
};
