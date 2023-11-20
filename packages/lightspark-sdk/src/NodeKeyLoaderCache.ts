import {
  DefaultCrypto,
  LightsparkSigningException,
  type CryptoInterface,
  type NodeKeyCache,
  type Requester,
  type SigningKey,
} from "@lightsparkdev/core";
import {
  MasterSeedSigningKeyLoader,
  NodeIdAndPasswordSigningKeyLoader,
  isMasterSeedSigningKeyLoaderArgs,
  isNodeIdAndPasswordSigningKeyLoaderArgs,
  type SigningKeyLoader,
  type SigningKeyLoaderArgs,
} from "./SigningKeyLoader.js";

/**
 * A cache for SigningKeyLoaders associated with nodes.
 */
export default class NodeKeyLoaderCache {
  private idToLoader: Map<string, SigningKeyLoader>;

  constructor(
    private readonly nodeKeyCache: NodeKeyCache,
    private readonly cryptoImpl: CryptoInterface = DefaultCrypto,
  ) {
    this.idToLoader = new Map();
  }

  /**
   * Sets the signing key loader for a node.
   * Instantiates a signing key loader based on the type of args passed in by
   * the user.
   *
   * @param nodeId The ID of the node to get the key for
   * @param loaderArgs Loader arguments for loading the key
   * @param requester Requester used for loading the key
   */
  setLoader(
    nodeId: string,
    loaderArgs: SigningKeyLoaderArgs,
    requester: Requester,
  ) {
    let loader: SigningKeyLoader;
    if (isNodeIdAndPasswordSigningKeyLoaderArgs(loaderArgs)) {
      loader = new NodeIdAndPasswordSigningKeyLoader(
        { nodeId, ...loaderArgs },
        requester,
        this.cryptoImpl,
      );
    } else if (isMasterSeedSigningKeyLoaderArgs(loaderArgs)) {
      loader = new MasterSeedSigningKeyLoader({ ...loaderArgs });
    } else {
      throw new LightsparkSigningException("Invalid signing key loader args");
    }

    this.idToLoader.set(nodeId, loader);
  }

  /**
   * Gets the key for a node using the loader set by [setLoader]
   *
   * @param id The ID of the node to get the key for
   * @returns The loaded key
   */
  async getKeyWithLoader(id: string): Promise<SigningKey | undefined> {
    if (this.nodeKeyCache.hasKey(id)) {
      return this.nodeKeyCache.getKey(id);
    }

    const loader = this.idToLoader.get(id);
    if (!loader) {
      throw new LightsparkSigningException(
        "No signing key loader found for node " + id,
      );
    }
    const loaderResult = await loader.loadSigningKey();
    if (!loaderResult) {
      return;
    }

    const key = await this.nodeKeyCache.loadKey(
      id,
      { key: loaderResult.key },
      loaderResult.type,
    );
    return key || undefined;
  }
}
