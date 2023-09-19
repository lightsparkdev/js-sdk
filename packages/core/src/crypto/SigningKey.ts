import { createHash } from "crypto";
import secp256k1 from "secp256k1";
import { hexToBytes, SigningKeyType, type CryptoInterface } from "../index.js";

interface Alias {
  alias: string;
}

function isAlias(key: CryptoKey | Alias): key is Alias {
  return "alias" in key;
}

export abstract class SigningKey {
  readonly type: SigningKeyType;

  constructor(type: SigningKeyType) {
    this.type = type;
  }

  abstract sign(data: Uint8Array): Promise<ArrayBuffer>;
}

export class RSASigningKey extends SigningKey {
  constructor(
    private readonly privateKey: CryptoKey | Alias,
    private readonly cryptoImpl: CryptoInterface,
  ) {
    super(SigningKeyType.RSASigningKey);
  }

  async sign(data: Uint8Array) {
    const key = isAlias(this.privateKey)
      ? this.privateKey.alias
      : this.privateKey;
    return this.cryptoImpl.sign(key, data);
  }
}

export class Secp256k1SigningKey extends SigningKey {
  constructor(private readonly privateKey: string) {
    super(SigningKeyType.Secp256k1SigningKey);
  }

  async sign(data: Uint8Array) {
    const keyBytes = new Uint8Array(hexToBytes(this.privateKey));
    const hash = createHash("sha256").update(data).digest();
    const signResult = secp256k1.ecdsaSign(hash, keyBytes);
    return signResult.signature;
  }
}
