// Copyright  ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import type { CryptoInterface, GeneratedKeyPair } from "@lightsparkdev/core";
import { b64decode, b64encode, LightsparkException } from "@lightsparkdev/core";
import * as LsCrypto from "@lightsparkdev/ls-react-native-crypto";

export function decryptSecretWithNodePassword(/* cipher: string, encryptedSecret: string, nodePassword: string */): Promise<ArrayBuffer | null> {
  throw new LightsparkException(
    "NOT_IMPLEMENTED",
    "Recovering the signing key is not yet supported in React Native.",
  );
}

export const generateSigningKeyPair = async (): Promise<GeneratedKeyPair> => {
  const exportedKey = await LsCrypto.generateSigningKeyPair();
  return {
    publicKey: exportedKey.publicKey.keyBytes,
    privateKey: exportedKey.privateKey.keyBytes,
    keyAlias: exportedKey.alias,
  };
};

export const serializeSigningKey = async (
  key: CryptoKey | string,
  format: "pkcs8" | "spki",
): Promise<ArrayBuffer> => {
  const isPrivateKey = format === "pkcs8";
  if (typeof key !== "string") {
    throw new LightsparkException(
      "NOT_SUPPORTED",
      "Cannot serialize a CryptoKey in React Native. Use the alias instead.",
    );
  }
  const exportedKeys = await LsCrypto.serializeSigningKey(key);
  const keyBytes = isPrivateKey
    ? exportedKeys.privateKey.keyBytes
    : exportedKeys.publicKey.keyBytes;
  return b64decode(keyBytes);
};

export const getNonce = () => {
  return LsCrypto.getNonce();
};

export const sign = async (
  keyOrAlias: CryptoKey | string,
  data: Uint8Array,
): Promise<ArrayBuffer> => {
  if (typeof keyOrAlias !== "string") {
    throw new LightsparkException(
      "NOT_SUPPORTED",
      "Cannot sign with a CryptoKey in React Native. Use the alias instead.",
    );
  }

  return b64decode(await LsCrypto.sign(keyOrAlias, b64encode(data)));
};

const importPrivateSigningKey = async (
  keyData: Uint8Array,
): Promise<CryptoKey | string> => {
  return LsCrypto.importPrivateSigningKey(b64encode(keyData));
};

export const ReactNativeCrypto: CryptoInterface = {
  decryptSecretWithNodePassword,
  generateSigningKeyPair,
  serializeSigningKey,
  getNonce,
  sign,
  importPrivateSigningKey,
};
