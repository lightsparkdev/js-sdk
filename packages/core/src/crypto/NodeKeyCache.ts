// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";

import { b64decode } from "../utils/base64.js";
import type { CryptoInterface } from "./crypto.js";
import { DefaultCrypto } from "./crypto.js";
import type { KeyOrAliasType } from "./KeyOrAlias.js";

class NodeKeyCache {
  private idToKey: Map<string, CryptoKey | string>;
  constructor(private readonly cryptoImpl: CryptoInterface = DefaultCrypto) {
    this.idToKey = new Map();
    autoBind(this);
  }

  public async loadKey(
    id: string,
    keyOrAlias: KeyOrAliasType
  ): Promise<CryptoKey | string | null> {
    if (keyOrAlias.alias !== undefined) {
      this.idToKey.set(id, keyOrAlias.alias);
      return keyOrAlias.alias;
    }
    const decoded = b64decode(this.stripPemTags(keyOrAlias.key));
    try {
      const key = await this.cryptoImpl.importPrivateSigningKey(decoded);
      this.idToKey.set(id, key);
      return key;
    } catch (e) {
      console.log("Error importing key: ", e);
    }
    return null;
  }

  public getKey(id: string): CryptoKey | string | undefined {
    return this.idToKey.get(id);
  }

  public hasKey(id: string): boolean {
    return this.idToKey.has(id);
  }

  private stripPemTags(pem: string): string {
    return pem
      .replace(/-----BEGIN (.*)-----/, "")
      .replace(/-----END (.*)----/, "");
  }
}

export default NodeKeyCache;
