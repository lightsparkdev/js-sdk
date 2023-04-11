// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";

import { b64decode } from "../utils/base64.js";

let cryptoImplPromise: Promise<typeof crypto>;
if (typeof crypto !== "undefined") {
  cryptoImplPromise = Promise.resolve(crypto);
} else {
  cryptoImplPromise = import("crypto").then((nodeCrypto) => {
    return nodeCrypto as typeof crypto;
  });
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
      const cryptoImpl = await cryptoImplPromise;
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
