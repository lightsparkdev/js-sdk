// Copyright  ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import {
  b64encode,
  CryptoInterface,
  LightsparkException,
} from "@lightsparkdev/core";
import QuickCrypto from "react-native-quick-crypto";

// TODO: Investigate why react-native libs keep importing weirdly like this.
const qCrypto = QuickCrypto as unknown as typeof QuickCrypto.default;

const getRandomValues32 = async (arr: Uint32Array): Promise<Uint32Array> => {
  return qCrypto.getRandomValues(arr) as Uint32Array;
};

export async function decryptSecretWithNodePassword(
  cipher: string,
  encryptedSecret: string,
  nodePassword: string
): Promise<ArrayBuffer | null> {
  throw new LightsparkException(
    "NOT_IMPLEMENTED",
    "Recovering the signing key is not yet supported in React Native."
  );
}

export const generateSigningKeyPair = async (): Promise<{
  publicKey: string;
  privateKey: string;
}> => {
  return new Promise((resolve, reject) => {
    // TODO: Get the async version of this to actually work. It gives unhelpful errors.
    const keypair = qCrypto.generateKeyPairSync("rsa-pss", {
      modulusLength: 4096,
      //   publicExponent: 0x10001,
      // We should be passing this line, but there's a bug in the library. Fix is in
      // https://github.com/margelo/react-native-quick-crypto/pull/175, but waiting for approval.
      // hashAlgorithm: "sha256",
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    // Strip the PEM headers for consistency with the web implementation.
    resolve({
      publicKey: keypair.publicKey.slice(27, keypair.publicKey.length - 25),
      privateKey: keypair.privateKey.slice(28, keypair.privateKey.length - 26),
    });
  });
};

export const serializeSigningKey = async (
  key: CryptoKey | string,
  format: "pkcs8" | "spki"
): Promise<ArrayBuffer> => {
  throw new LightsparkException(
    "NOT_IMPLEMENTED",
    "Cannot serialize a signing key in React Native. The keys you get from generateSigningKeyPair" +
      " are already serialized buffers."
  );
};

export const getNonce = async () => {
  const nonceSt = await getRandomValues32(new Uint32Array(1));
  return Number(nonceSt);
};

export const sign = (
  key: CryptoKey | Uint8Array,
  data: Uint8Array
): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    // TODO: Get the async version of this to actually work.
    console.info("Signing data");
    const sign = qCrypto.createSign("SHA256");
    sign.update(data, "utf8");
    const signature = sign.sign({
      key: addPemTags(key as Uint8Array),
      padding: qCrypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: qCrypto.constants.RSA_PSS_SALTLEN_MAX_SIGN,
    });
    resolve(signature as Buffer);
  });
};

// TODO: Remove the need for this. It's super gross and fragile, but the react-native-quick-crypto library
// fails in mysterious ways when trying to just use raw bytes or the key as-is. It's not clear why. We should move
// to another crypto library for RN or build our own.
const addPemTags = (key: Uint8Array) => {
  const keyString = b64encode(key);
  return `-----BEGIN PRIVATE KEY-----\n${keyString}\n-----END PRIVATE KEY-----`;
};

export const importPrivateSigningKey = async (
  keyData: Uint8Array,
  format: "pkcs8" | "spki"
): Promise<CryptoKey | Uint8Array> => {
  // no op.
  return Promise.resolve(keyData);
};

export const ReactNativeCrypto: CryptoInterface = {
  decryptSecretWithNodePassword,
  generateSigningKeyPair,
  serializeSigningKey,
  getNonce,
  sign,
  importPrivateSigningKey,
};
