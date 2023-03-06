import autoBind from "auto-bind";
import NodeCrypto from "crypto";

import { b64decode } from "../utils/base64.js";

let cryptoImpl: typeof NodeCrypto | typeof crypto;
if (typeof crypto !== "undefined") {
  cryptoImpl = crypto;
} else {
  cryptoImpl = NodeCrypto;
}

class NodeKeyCache {
  private idToKey: Map<string, CryptoKey>;
  constructor() {
    this.idToKey = new Map();
    autoBind(this);
  }

  public async loadKey(id: string, rawKey: string): Promise<CryptoKey | null> {
    const decoded = b64decode(rawKey);
    try {
      const key = await cryptoImpl.subtle.importKey(
        "pkcs8",
        decoded,
        {
          name: "RSA-PSS",
          hash: "SHA-256",
        },
        true,
        ["sign"]
      );
      this.idToKey.set(id, key);
      return key;
    } catch (e) {
      debugger;
      console.log("Error importing key: ", e);
    }
    return null;
  }

  public getKey(id: string): CryptoKey | undefined {
    return this.idToKey.get(id);
  }

  public hasKey(id: string): boolean {
    return this.idToKey.has(id);
  }
}

export default NodeKeyCache;
