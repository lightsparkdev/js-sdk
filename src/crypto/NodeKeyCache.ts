import autoBind from "auto-bind";
import { b64decode } from "utils/base64";

class NodeKeyCache {
  private idToKey: Map<string, CryptoKey>;
  constructor() {
    this.idToKey = new Map();
    autoBind(this);
  }

  public async loadKey(id: string, rawKey: string): Promise<CryptoKey> {
    const decoded = b64decode(rawKey);

    const key = await crypto.subtle.importKey(
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
  }

  public getKey(id: string): CryptoKey | undefined {
    return this.idToKey.get(id);
  }
}

export default NodeKeyCache;