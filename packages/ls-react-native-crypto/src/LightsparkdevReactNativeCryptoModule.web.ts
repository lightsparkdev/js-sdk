import { ExportedKeys } from ".";

const keyMap = new Map<string, CryptoKey>();

export default {
  async generateSigningKeyPair(): Promise<ExportedKeys> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );
    const handle = `key_${await this.getNonce()}`;
    keyMap.set(`${handle}_priv`, keyPair.privateKey);
    keyMap.set(`${handle}_pub`, keyPair.publicKey);
    return {
      privateKey: {
        keyBytes: Buffer.from(
          await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
        ).toString("base64"),
        format: "pkcs8",
      },
      publicKey: {
        keyBytes: Buffer.from(
          await crypto.subtle.exportKey("spki", keyPair.publicKey)
        ).toString("base64"),
        format: "spki",
      },
      alias: handle,
    };
  },

  async serializeSigningKey(keyAlias: string): Promise<ExportedKeys> {
    const privateKey = keyMap.get(`${keyAlias}_priv`);
    const publicKey = keyMap.get(`${keyAlias}_pub`);
    if (!privateKey) {
      throw new Error("Key not found");
    }
    const privateKeyData = await crypto.subtle.exportKey("pkcs8", privateKey);
    const publicKeyData = publicKey
      ? await crypto.subtle.exportKey("spki", publicKey)
      : new ArrayBuffer(0);
    return {
      privateKey: {
        keyBytes: Buffer.from(privateKeyData).toString("base64"),
        format: "pkcs8",
      },
      publicKey: {
        keyBytes: Buffer.from(publicKeyData).toString("base64"),
        format: "spki",
      },
      alias: keyAlias,
    };
  },

  async importPrivateSigningKey(keyData: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      "pkcs8",
      Buffer.from(keyData, "base64"),
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );
    const handle = `key_${await this.getNonce()}`;
    keyMap.set(`${handle}_priv`, key);
    return handle;
  },

  async sign(keyAlias: string, data: string): Promise<string> {
    const key = keyMap.get(`${keyAlias}_priv`);
    if (!key) {
      throw new Error("Key not found");
    }
    const signature = await crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      key,
      Buffer.from(data, "base64")
    );
    return Buffer.from(signature).toString("base64");
  },

  async getNonce(): Promise<number> {
    const nonceSt = await crypto.getRandomValues(new Uint32Array(1));
    return Number(nonceSt);
  },
};
