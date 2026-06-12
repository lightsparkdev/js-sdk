// Turnkey crypto: P-256 keygen, HPKE seal, wallet signature, and the X-Stamp
// builder. Session-key *state* lives in `session.ts`; this module only does the
// crypto and reads/writes that state through it.

import {
  formatHpkeBuf,
  generateP256KeyPair,
  hpkeEncrypt,
} from "@turnkey/crypto";
import { signWithApiKey } from "@turnkey/api-key-stamper";

import { TURNKEY_STAMP_SCHEME } from "./config";
import { type ClientKeyPair, resolveSessionKeys, setClientKeyPair } from "./session";

// Generate the client-side P-256 keypair (Verify-bundle model). The
// uncompressed public key (130 hex chars, 0x04-prefixed) goes to Grid as
// `clientPublicKey` on Verify; the private key stays client-side to
// HPKE-decrypt the `encryptedSessionSigningKey` Grid hands back. Stored in
// `session.ts` so a session decrypted under one keypair stays valid across tabs.
export function generateClientKeyPair(): ClientKeyPair {
  const kp = generateP256KeyPair();
  const clientKeyPair: ClientKeyPair = {
    privateKey: kp.privateKey,
    publicKey: kp.publicKey,
    publicKeyUncompressed: kp.publicKeyUncompressed,
  };
  setClientKeyPair(clientKeyPair);
  return clientKeyPair;
}

export async function turnkeyStamp(payload: string): Promise<string> {
  const keys = resolveSessionKeys();
  if (!keys)
    throw new Error(
      "No session signing key — log in (Verify) first to establish a session.",
    );
  const { apiPublicKey, apiPrivateKey } = keys;
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
