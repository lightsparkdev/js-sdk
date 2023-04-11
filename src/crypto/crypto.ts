// Copyright  ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import LightsparkException from "../LightsparkException.js";

import { b64decode, b64encode } from "../utils/base64.js";

const ITERATIONS = 500000;
let cryptoImplPromise: Promise<typeof crypto>;
if (typeof crypto !== "undefined") {
  cryptoImplPromise = Promise.resolve(crypto);
} else {
  cryptoImplPromise = import("crypto").then((nodeCrypto) => {
    return nodeCrypto as typeof crypto;
  });
}

const getRandomValues = async (arr: Uint8Array): Promise<Uint8Array> => {
  if (typeof crypto !== "undefined") {
    return crypto.getRandomValues(arr);
  } else {
    return cryptoImplPromise.then((c) => c.getRandomValues(arr));
  }
};

const getRandomValues32 = async (arr: Uint32Array): Promise<Uint32Array> => {
  if (typeof crypto !== "undefined") {
    return crypto.getRandomValues(arr);
  } else {
    return cryptoImplPromise.then((c) => c.getRandomValues(arr));
  }
};

const deriveKey = async (
  password: string,
  salt: ArrayBuffer,
  iterations: number,
  algorithm: string,
  bit_len: number
): Promise<[CryptoKey, ArrayBuffer]> => {
  const enc = new TextEncoder();
  const cryptoImpl = await cryptoImplPromise;
  const password_key = await cryptoImpl.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const derived = await cryptoImpl.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    password_key,
    bit_len
  );

  // Split the derived bytes into a 32 byte AES key and a 16 byte IV
  const key = await cryptoImpl.subtle.importKey(
    "raw",
    derived.slice(0, 32),
    { name: algorithm, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const iv = derived.slice(32);

  return [key, iv];
};

export const encrypt = async (
  plaintext: ArrayBuffer,
  password: string,
  salt?: Uint8Array
): Promise<[string, string]> => {
  if (!salt) {
    salt = new Uint8Array(16);
    getRandomValues(salt);
  }

  const [key, iv] = await deriveKey(password, salt, ITERATIONS, "AES-GCM", 352);
  const cryptoImpl = await cryptoImplPromise;

  const encrypted = new Uint8Array(
    await cryptoImpl.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext)
  );

  const output = new Uint8Array(salt.byteLength + encrypted.byteLength);
  output.set(salt);
  output.set(encrypted, salt.byteLength);

  const header = {
    v: 4,
    i: ITERATIONS,
  };

  return [JSON.stringify(header), b64encode(output)];
};

export const decrypt = async (
  header_json: string,
  ciphertext: string,
  password: string
): Promise<ArrayBuffer> => {
  var decoded = b64decode(ciphertext);

  var header;
  if (header_json === "AES_256_CBC_PBKDF2_5000_SHA256") {
    header = {
      v: 0,
      i: 5000,
    };
    // Strip "Salted__" prefix
    decoded = decoded.slice(8);
  } else {
    header = JSON.parse(header_json);
  }

  if (header.v < 0 || header.v > 4) {
    throw new LightsparkException(
      "DecryptionError",
      "Unknown version ".concat(header.v)
    );
  }

  const cryptoImpl = await cryptoImplPromise;
  const algorithm = header.v < 2 ? "AES-CBC" : "AES-GCM";
  const bit_len = header.v < 4 ? 384 : 352;
  const salt_len = header.v < 4 ? 8 : 16;

  if (header.lsv === 2 || header.v === 3) {
    const salt = decoded.slice(decoded.length - 8, decoded.length);
    const nonce = decoded.slice(0, 12);
    const cipherText = decoded.slice(12, decoded.length - 8);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [key, _iv] = await deriveKey(
      password,
      salt,
      header.i,
      algorithm,
      256
    );
    return await cryptoImpl.subtle.decrypt(
      { name: algorithm, iv: nonce.buffer },
      key,
      cipherText
    );
  } else {
    const salt = decoded.slice(0, salt_len);
    const encrypted = decoded.slice(salt_len);
    const [key, iv] = await deriveKey(
      password,
      salt,
      header.i,
      algorithm,
      bit_len
    );
    return await cryptoImpl.subtle.decrypt(
      { name: algorithm, iv },
      key,
      encrypted
    );
  }
};

export async function decryptSecretWithNodePassword(
  cipher: string,
  encryptedSecret: string,
  nodePassword: string
): Promise<ArrayBuffer | null> {
  let decryptedValue: ArrayBuffer | null = null;
  try {
    decryptedValue = await decrypt(cipher, encryptedSecret, nodePassword);
  } catch (ex) {
    // If the password is incorrect, we're likely to get UTF-8 decoding errors.
    // Catch everything and we'll leave the value as the empty string.
    console.error(ex);
  }
  return decryptedValue;
}

export function decode(arrBuff: ArrayBuffer): string {
  const dec = new TextDecoder();
  return dec.decode(arrBuff);
}

export const generateNodeKey = async (): Promise<CryptoKeyPair> => {
  const cryptoImpl = await cryptoImplPromise;
  return await cryptoImpl.subtle.generateKey(
    /*algorithm:*/ {
      name: "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    /*extractable*/ true,
    /*keyUsages*/ ["sign", "verify"]
  );
};

export const serializeNodeKey = async (
  key: CryptoKey,
  format: "pkcs8" | "spki"
): Promise<ArrayBuffer> => {
  const cryptoImpl = await cryptoImplPromise;
  return await cryptoImpl.subtle.exportKey(/*format*/ format, /*key*/ key);
};

export const encryptWithNodeKey = async (
  key: CryptoKey,
  data: string
): Promise<string> => {
  const enc = new TextEncoder();
  const encoded = enc.encode(data);
  // @ts-ignore
  const encrypted = await cryptoImpl.subtle.encrypt(
    /*algorithm:*/ {
      name: "RSA-OAEP",
    },
    /*key*/ key,
    /*data*/ encoded
  );
  // @ts-ignore
  return b64encode(encrypted);
};

export const loadNodeEncryptionKey = async (
  rawPublicKey: string
): Promise<CryptoKey> => {
  const encoded = b64decode(rawPublicKey);
  const cryptoImpl = await cryptoImplPromise;
  return await cryptoImpl.subtle.importKey(
    /*format*/ "spki",
    /*keyData*/ encoded,
    /*algorithm:*/ {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    /*extractable*/ true,
    /*keyUsages*/ ["encrypt"]
  );
};

export const getNonce = async () => {
  const nonceSt = await getRandomValues32(new Uint32Array(1));
  return Number(nonceSt);
};

export { default as LightsparkSigningException } from "./LightsparkSigningException.js";
