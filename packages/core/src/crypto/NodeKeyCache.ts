// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";

import { b64decode } from "../utils/base64.js";
import type { CryptoInterface } from "./crypto.js";
import { DefaultCrypto, LightsparkSigningException } from "./crypto.js";
import type { KeyOrAliasType } from "./KeyOrAlias.js";
import {
  RSASigningKey,
  Secp256k1SigningKey,
  type SigningKey,
} from "./SigningKey.js";
import { SigningKeyType } from "./types.js";

class NodeKeyCache {
  private idToKey: Map<string, SigningKey>;

  constructor(private readonly cryptoImpl: CryptoInterface = DefaultCrypto) {
    this.idToKey = new Map();
    autoBind(this);
  }

  public async loadKey(
    id: string,
    keyOrAlias: KeyOrAliasType,
    signingKeyType: SigningKeyType,
  ): Promise<SigningKey | null> {
    let signingKey: SigningKey;

    if (keyOrAlias.alias !== undefined) {
      switch (signingKeyType) {
        case SigningKeyType.RSASigningKey:
          signingKey = new RSASigningKey(
            { alias: keyOrAlias.alias },
            this.cryptoImpl,
          );
          break;
        default:
          throw new LightsparkSigningException(
            `Aliases are not supported for signing key type ${signingKeyType}`,
          );
      }

      this.idToKey.set(id, signingKey);
      return signingKey;
    }

    try {
      if (signingKeyType === SigningKeyType.Secp256k1SigningKey) {
        signingKey = new Secp256k1SigningKey(keyOrAlias.key);
      } else {
        const decoded = b64decode(this.stripPemTags(keyOrAlias.key));
        const cryptoKeyOrAlias =
          await this.cryptoImpl.importPrivateSigningKey(decoded);
        const key =
          typeof cryptoKeyOrAlias === "string"
            ? { alias: cryptoKeyOrAlias }
            : cryptoKeyOrAlias;
        signingKey = new RSASigningKey(key, this.cryptoImpl);
      }

      this.idToKey.set(id, signingKey);
      return signingKey;
    } catch (e) {
      console.log("Error importing key: ", e);
    }
    return null;
  }

  public getKey(id: string): SigningKey | undefined {
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
