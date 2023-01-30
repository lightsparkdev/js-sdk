// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { b64decode, b64encode } from "utils/base64";

const ITERATIONS = 500000;

const crypto = window.crypto;

const deriveKey = async (
  password: string,
  salt: ArrayBuffer,
  iterations: number,
  algorithm: string,
  bit_len: number
): Promise<[CryptoKey, ArrayBuffer]> => {
  const enc = new TextEncoder();
  const password_key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const derived = await crypto.subtle.deriveBits(
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
  const key = await crypto.subtle.importKey(
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
    crypto.getRandomValues(salt);
  }

  const [key, iv] = await deriveKey(password, salt, ITERATIONS, "AES-GCM", 352);

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext)
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
    throw new Error("Unknown version ".concat(header.v));
  }

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
    return await crypto.subtle.decrypt(
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
    return await crypto.subtle.decrypt({ name: algorithm, iv }, key, encrypted);
  }
};

export async function decryptSecretWithNodePassword(
  cipher: string,
  encryptedSecret: string,
  nodePassword: string
): Promise<ArrayBuffer | null> {
  let decryptedValue: ArrayBuffer|null = null;
  try {
    decryptedValue = await decrypt(
      cipher,
      encryptedSecret,
      nodePassword
    );
  } catch (ex) {
    // If the password is incorrect, we're likely to get UTF-8 decoding errors.
    // Catch everything and we'll leave the value as the empty string.
  }
  return decryptedValue;
}

export function decode(arrBuff: ArrayBuffer): string {
  const dec = new TextDecoder();
  return dec.decode(arrBuff);
}

export const generateNodeKey = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
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
  return await crypto.subtle.exportKey(/*format*/ format, /*key*/ key);
};

export const encryptWithNodeKey = async (
  key: CryptoKey,
  data: string
): Promise<string> => {
  const enc = new TextEncoder();
  const encoded = enc.encode(data);
  // @ts-ignore
  const encrypted = await crypto.subtle.encrypt(
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
  return await crypto.subtle.importKey(
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

export function getNonce() {
  return Number(crypto.getRandomValues(new Uint32Array(1)));
}
