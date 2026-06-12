// Turnkey crypto: P-256 keygen, HPKE seal, wallet signature, session-key state,
// and the X-Stamp builder.

import {
  decryptCredentialBundle,
  formatHpkeBuf,
  generateP256KeyPair,
  getPublicKey,
  hpkeEncrypt,
} from "@turnkey/crypto";
import { signWithApiKey } from "@turnkey/api-key-stamper";

import { TURNKEY_STAMP_SCHEME } from "./config";

// ----- Production-mode key state -----
//
// Generated client-side at the first call to `generateClientKeyPair`. The
// uncompressed public key (130 hex chars, 0x04-prefixed) goes to Grid as
// `clientPublicKey` on Verify; the private key is held here and used to
// HPKE-decrypt the `encryptedSessionSigningKey` Grid hands back, yielding
// the Turnkey API session keypair we then stamp `payloadToSign` with.
//
// In sandbox mode the bundle is shape-valid but undecryptable — sandbox
// flows skip this entire path and use the magic signature constants.

export interface ClientKeyPair {
  privateKey: string; // hex
  publicKey: string; // hex, compressed
  publicKeyUncompressed: string; // hex, 130 chars (0x04 prefix)
}

export interface SessionKeys {
  apiPublicKey: string; // hex, compressed P-256
  apiPrivateKey: string; // hex
}

let clientKeyPair: ClientKeyPair | null = null;
let lastEncryptedSessionSigningKey: string | null = null;
let cachedSessionKeys: SessionKeys | null = null;

export function generateClientKeyPair(): ClientKeyPair {
  const kp = generateP256KeyPair();
  clientKeyPair = {
    privateKey: kp.privateKey,
    publicKey: kp.publicKey,
    publicKeyUncompressed: kp.publicKeyUncompressed,
  };
  // Re-using the keypair across credential types means a Verify by any
  // type cycles fresh session bundles bound to the same client key —
  // simpler than tracking one keypair per type for the test app.
  cachedSessionKeys = null;
  lastEncryptedSessionSigningKey = null;
  return clientKeyPair;
}

export function rememberEncryptedSessionSigningKey(value: unknown): void {
  if (typeof value === "string" && value) {
    lastEncryptedSessionSigningKey = value;
    cachedSessionKeys = null;
  }
}

// OTP_LOGIN / STAMP_LOGIN model: there is no encryptedSessionSigningKey bundle
// — the TEK private key *is* the session's API key once login registers it.
// Cache it directly so turnkeyStamp() can authorize later signed retries
// (e.g. adding a passkey) without the Verify-style clientKeyPair + bundle.
export function setSessionKeysFromTek(tek: {
  publicKey: string;
  privateKey: string;
}): void {
  cachedSessionKeys = {
    apiPublicKey: tek.publicKey,
    apiPrivateKey: tek.privateKey,
  };
}

function decryptSessionKeysOrThrow(): SessionKeys {
  if (cachedSessionKeys) return cachedSessionKeys;
  if (!clientKeyPair)
    throw new Error(
      "No client keypair — run a Verify in production mode first.",
    );
  if (!lastEncryptedSessionSigningKey)
    throw new Error(
      "No encryptedSessionSigningKey — run a Verify in production mode first.",
    );
  const apiPrivateKey = decryptCredentialBundle(
    lastEncryptedSessionSigningKey,
    clientKeyPair.privateKey,
  );
  const apiPublicKeyBytes = getPublicKey(apiPrivateKey, /*isCompressed*/ true);
  const apiPublicKey = Array.from(apiPublicKeyBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  cachedSessionKeys = { apiPublicKey, apiPrivateKey };
  return cachedSessionKeys;
}

export async function turnkeyStamp(payload: string): Promise<string> {
  const { apiPublicKey, apiPrivateKey } = decryptSessionKeysOrThrow();
  // `signWithApiKey` returns the hex DER signature; the X-Stamp header
  // value is base64url(JSON({publicKey, scheme, signature})) with that
  // hex signature embedded as-is. Mirrors what `@turnkey/api-key-stamper`
  // produces internally; replicated here so we can fill the field on the
  // test UI rather than going through the stamper's `stamp(payload)` shape
  // (which returns `{stampHeaderName, stampHeaderValue}`).
  const signature = await signWithApiKey({
    content: payload,
    publicKey: apiPublicKey,
    privateKey: apiPrivateKey,
  });
  const stamp = {
    publicKey: apiPublicKey,
    scheme: TURNKEY_STAMP_SCHEME,
    signature,
  };
  const json = JSON.stringify(stamp);
  // base64url(json) — no padding.
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ----- V3 secure OTP client crypto -----
//
// HPKE-seal {clientPublicKey, otpCodeAttempt} under the enclave's
// `otpEncryptionTargetBundle`. That bundle is a signed enclave envelope —
// {version, data, dataSignature, enclaveQuorumPublic} — where `data` is a
// hex-encoded JSON blob carrying the enclave's uncompressed HPKE target key as
// `targetPublic`. We pull `targetPublic` out, HPKE-encrypt under it, and emit
// Turnkey's `formatHpkeBuf` wire shape {"encappedPublic","ciphertext"} — exactly
// what `@turnkey/crypto`'s `encryptPrivateKeyToBundle` produces for the
// analogous key-import flow. (A production client would also verify
// `dataSignature` against `enclaveQuorumPublic`; skipped here because the bundle
// originates from our own backend in this test app.)
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function sealOtpBundle(
  targetBundle: string,
  clientPublicKeyHex: string,
  otpCode: string,
): string {
  const parsed = JSON.parse(targetBundle) as { data: string };
  const signedData = JSON.parse(
    new TextDecoder().decode(hexToBytes(parsed.data)),
  ) as { targetPublic: string };
  const targetKeyBuf = hexToBytes(signedData.targetPublic); // 65-byte uncompressed
  const plainTextBuf = new TextEncoder().encode(
    // The enclave expects snake_case {otp_code, public_key} — NOT the
    // {clientPublicKey, otpCodeAttempt} shown in Turnkey's docs sequence
    // diagram. Matches @turnkey/crypto's encryptOtpCodeToBundle.
    JSON.stringify({ otp_code: otpCode, public_key: clientPublicKeyHex }),
  );
  const encryptedBuf = hpkeEncrypt({ plainTextBuf, targetKeyBuf }); // compressed_enc[33] || ciphertext
  return formatHpkeBuf(encryptedBuf); // {"encappedPublic","ciphertext"}
}

// Build the `Grid-Wallet-Signature` stamp over the verificationToken using a
// specific keypair (the V3 TEK), not the session key — base64url(JSON({
// publicKey, scheme, signature})), the shape `parse_api_key_stamp` expects.
export async function buildWalletSignature(
  publicKeyHex: string,
  privateKeyHex: string,
  payload: string,
): Promise<string> {
  const signature = await signWithApiKey({
    content: payload,
    publicKey: publicKeyHex,
    privateKey: privateKeyHex,
  });
  const stamp = {
    publicKey: publicKeyHex,
    scheme: TURNKEY_STAMP_SCHEME,
    signature,
  };
  return btoa(JSON.stringify(stamp))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
