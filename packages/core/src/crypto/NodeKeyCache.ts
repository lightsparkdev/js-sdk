// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";

import { b64decode } from "../utils/base64.js";
import { CryptoInterface, DefaultCrypto } from "./crypto.js";

class NodeKeyCache {
  private idToKey: Map<string, CryptoKey | Uint8Array>;
  constructor(private readonly cryptoImpl: CryptoInterface = DefaultCrypto) {
    this.idToKey = new Map();
    autoBind(this);
  }

  public async loadKey(
    id: string,
    rawKey: string,
    format: "pkcs8" | "spki" = "pkcs8"
  ): Promise<CryptoKey | Uint8Array | null> {
    const decoded = b64decode(this.stripPemTags(rawKey));
    try {
      const key = await this.cryptoImpl.importPrivateSigningKey(
        decoded,
        format
      );
      this.idToKey.set(id, key);
      return key;
    } catch (e) {
      console.log("Error importing key: ", e);
    }
    return null;
  }

  public getKey(id: string): CryptoKey | Uint8Array | undefined {
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
