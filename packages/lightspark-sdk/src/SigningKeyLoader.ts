import {
  LightsparkSigningException,
  SigningKeyType,
  b64encode,
  isBrowser,
  type CryptoInterface,
  type Maybe,
  type Requester,
} from "@lightsparkdev/core";
import { RecoverNodeSigningKey } from "./graphql/RecoverNodeSigningKey.js";
import { BitcoinNetwork } from "./index.js";

const SIGNING_KEY_PATH = "m/5";

/**
 * Args for creating a new SigningKeyLoader. Must be one of the sub types.
 */
export type SigningKeyLoaderArgs =
  | NodeIdAndPasswordSigningKeyLoaderArgs
  | MasterSeedSigningKeyLoaderArgs;

/**
 * Args for creating a new SigningKeyLoader from a node ID and password.
 * This cannot be used if you are using remote signing.
 * It is used to recover an RSA operation signing key using the password you
 * chose when setting up your node. For REGTEST nodes, the password is
 * "1234!@#$".
 */
export interface NodeIdAndPasswordSigningKeyLoaderArgs {
  password: string;
}

/**
 * Internal version of NodeIdAndPasswordSigningKeyLoaderArgs that includes the
 * node ID.
 */
interface NodeIdAndPasswordSigningKeyLoaderArgsInternal
  extends NodeIdAndPasswordSigningKeyLoaderArgs {
  nodeId: string;
}

/**
 * Args for creating a new SigningKeyLoader from a master seed and network.
 * This should be used if you are using remote signing,
 * rather than an RSA operation signing key.
 */
export interface MasterSeedSigningKeyLoaderArgs {
  masterSeed: Uint8Array;
  network: BitcoinNetwork;
}

/**
 * The result of loading a signing key.
 */
export interface SigningKeyLoaderResult {
  key: string;
  type: SigningKeyType;
}

export interface SigningKeyLoader {
  loadSigningKey: () => Promise<SigningKeyLoaderResult | undefined>;
}

export function isNodeIdAndPasswordSigningKeyLoaderArgs(
  args: SigningKeyLoaderArgs,
): args is NodeIdAndPasswordSigningKeyLoaderArgs {
  return (args as NodeIdAndPasswordSigningKeyLoaderArgs).password !== undefined;
}

export function isMasterSeedSigningKeyLoaderArgs(
  args: SigningKeyLoaderArgs,
): args is MasterSeedSigningKeyLoaderArgs {
  return (args as MasterSeedSigningKeyLoaderArgs).masterSeed !== undefined;
}

/**
 * Key loader that loads an RSA signing key by providing a node ID and password
 * to recover the key from Lightspark.
 */
export class NodeIdAndPasswordSigningKeyLoader implements SigningKeyLoader {
  private readonly nodeId: string;
  private readonly password: string;
  private readonly requester: Requester;
  private readonly cryptoImpl: CryptoInterface;

  constructor(
    args: NodeIdAndPasswordSigningKeyLoaderArgsInternal,
    requester: Requester,
    cryptoImpl: CryptoInterface,
  ) {
    this.nodeId = args.nodeId;
    this.password = args.password;
    this.requester = requester;
    this.cryptoImpl = cryptoImpl;
  }

  async loadSigningKey() {
    const encryptedKey = await this.recoverNodeSigningKey();
    if (!encryptedKey) {
      console.warn("No encrypted key found for node " + this.nodeId);
      return;
    }

    const signingPrivateKey =
      await this.cryptoImpl.decryptSecretWithNodePassword(
        encryptedKey.cipher,
        encryptedKey.encrypted_value,
        this.password,
      );

    if (!signingPrivateKey) {
      throw new LightsparkSigningException(
        "Unable to decrypt signing key with provided password. Please try again.",
      );
    }

    let signingPrivateKeyPEM = "";
    if (new Uint8Array(signingPrivateKey)[0] === 48) {
      // Support DER format - https://github.com/lightsparkdev/webdev/pull/1982
      signingPrivateKeyPEM = b64encode(signingPrivateKey);
    } else {
      const dec = new TextDecoder();
      signingPrivateKeyPEM = dec.decode(signingPrivateKey);
    }

    return { key: signingPrivateKeyPEM, type: SigningKeyType.RSASigningKey };
  }

  private async recoverNodeSigningKey(): Promise<
    Maybe<{ encrypted_value: string; cipher: string }>
  > {
    const response = await this.requester.makeRawRequest(
      RecoverNodeSigningKey,
      { nodeId: this.nodeId },
    );
    const nodeEntity = response.entity;
    if (nodeEntity?.__typename === "LightsparkNodeWithOSK") {
      return nodeEntity.encrypted_signing_private_key;
    }
    return null;
  }
}

/**
 * Key loader that loads a Secp256k1 signing key from a master seed.
 */
export class MasterSeedSigningKeyLoader implements SigningKeyLoader {
  private readonly masterSeed: Uint8Array;
  private readonly network: BitcoinNetwork;

  constructor(args: MasterSeedSigningKeyLoaderArgs) {
    this.masterSeed = args.masterSeed;
    this.network = args.network;
  }

  async loadSigningKey() {
    if (isBrowser) {
      throw new LightsparkSigningException(
        "Browser environments not supported for master seed signing key loader.",
      );
    }

    const { LightsparkSigner, Network } = await import(
      "@lightsparkdev/crypto-wasm"
    );

    let cryptoLibNetwork;
    switch (this.network) {
      case BitcoinNetwork.MAINNET:
        cryptoLibNetwork = Network.Bitcoin;
        break;
      case BitcoinNetwork.TESTNET:
        cryptoLibNetwork = Network.Testnet;
        break;
      case BitcoinNetwork.REGTEST:
        cryptoLibNetwork = Network.Regtest;
        break;
      default:
        throw new Error(
          `Unsupported lightspark_crypto network ${this.network}.`,
        );
    }
    const lightsparkSigner = LightsparkSigner.from_bytes(
      this.masterSeed,
      cryptoLibNetwork,
    );
    const privateKey = lightsparkSigner.derive_private_key(SIGNING_KEY_PATH);
    return { key: privateKey, type: SigningKeyType.Secp256k1SigningKey };
  }
}
