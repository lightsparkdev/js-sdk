// Manage flows: delete credential / session / export (guided issue → sign →
// retry), plus list credentials / sessions.
//
// DOM-free operation functions. The endpoints are identical across credential
// types, so these take the ids + platform `auth` directly. Each guided action
// owns the whole issue → sign → retry chain in one call, pulling the signature
// from the live session in production and from `SANDBOX_SIG` in sandbox; the
// separate issue/retry functions remain for inspecting the 202 between legs.

import {
  decryptExportBundle,
  generateP256KeyPair,
  hpkeDecrypt,
} from "@turnkey/crypto";

import { SANDBOX_SIG } from "../config";
import { apiDelete, apiGet, apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { turnkeyStamp } from "../turnkey";

// A 202-issuing leg: hit the issue endpoint and return its response data, from
// which the guided runner pulls `requestId` + `payloadToSign`.
type IssueLeg = () => Promise<unknown>;
// A signed-retry leg: re-hit the endpoint with the resolved signature headers.
type RetryLeg = (
  headers: Record<string, string>,
) => Promise<{ status: number; data: unknown }>;

// Resolve the Grid-Wallet-Signature for a guided signed retry: the sandbox
// magic value, or a real session stamp over the 202's payloadToSign in
// production. Throws a clear error if production lacks a payload/session.
async function guidedSignature(
  auth: ApiAuth,
  payloadToSign: string | undefined,
): Promise<string> {
  if (auth.mode !== "production") return SANDBOX_SIG;
  if (!payloadToSign)
    throw new Error(
      "No payloadToSign in the 202 challenge — cannot stamp this retry.",
    );
  return turnkeyStamp(payloadToSign);
}

function payloadFrom(data: unknown): string | undefined {
  const v = (data as Record<string, unknown>)?.payloadToSign;
  return typeof v === "string" ? v : undefined;
}
function requestIdFrom(data: unknown): string | undefined {
  const v = (data as Record<string, unknown>)?.requestId;
  return typeof v === "string" ? v : undefined;
}

export interface GuidedRetryResult {
  issued: unknown;
  retried: unknown;
}

// Run a guided issue → sign → retry chain: issue the 202, derive the signature
// (session stamp in production, magic value in sandbox), then forward the
// signed retry.
async function runGuidedRetry(
  reporter: Reporter,
  auth: ApiAuth,
  label: string,
  issue: IssueLeg,
  retry: RetryLeg,
): Promise<GuidedRetryResult> {
  const issued = await issue();
  reporter.log({
    level: "response",
    label: `${label} (issue)`,
    detail: issued,
  });
  const requestId = requestIdFrom(issued);
  if (!requestId)
    throw new Error(`No requestId in the ${label} 202 challenge.`);
  const signature = await guidedSignature(auth, payloadFrom(issued));
  const { data } = await retry({
    "Grid-Wallet-Signature": signature,
    "Request-Id": requestId,
  });
  reporter.log({ level: "response", label: `${label} (retry)`, detail: data });
  return { issued, retried: data };
}

// ----- Delete credential -----

export function deleteCredential(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
): Promise<GuidedRetryResult> {
  const path = `/auth/credentials/${encodeURIComponent(credId)}`;
  return runGuidedRetry(
    reporter,
    auth,
    "Delete Credential",
    () => apiDelete(auth, path).then((r) => r.data),
    (headers) => apiDelete(auth, path, headers),
  );
}

// ----- Delete session -----

export function deleteSession(
  reporter: Reporter,
  auth: ApiAuth,
  sessionId: string,
): Promise<GuidedRetryResult> {
  const path = `/auth/sessions/${encodeURIComponent(sessionId)}`;
  return runGuidedRetry(
    reporter,
    auth,
    "Delete Session",
    () => apiDelete(auth, path).then((r) => r.data),
    (headers) => apiDelete(auth, path, headers),
  );
}

// ----- Wallet export -----

// The export bundle is a signed enclave envelope; its `data` field hex-decodes
// to JSON carrying the HPKE encapsulated key, ciphertext, and the wallet's
// Turnkey sub-org id — so the org id `decryptExportBundle` checks comes from the
// bundle itself, not from session state.
interface ExportBundleData {
  encappedPublic: string;
  ciphertext: string;
  organizationId: string;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function parseBundleData(exportBundle: string): ExportBundleData {
  const { data } = JSON.parse(exportBundle) as { data: string };
  return JSON.parse(
    new TextDecoder().decode(hexToBytes(data)),
  ) as ExportBundleData;
}

// Pull the recovered mnemonic out of a sealed export bundle. In production the
// bundle is signed by the enclave, so `decryptExportBundle` verifies that
// signature before HPKE-decrypting. The sandbox backend returns an unsigned
// bundle (empty `dataSignature`/`enclaveQuorumPublic`), which that verification
// can't pass — so there we HPKE-decrypt the bundle directly, the same crypto
// minus the attestation check.
async function recoverMnemonic(
  auth: ApiAuth,
  exportBundle: string,
  privateKey: string,
): Promise<string> {
  if (auth.mode === "production") {
    const { organizationId } = parseBundleData(exportBundle);
    return decryptExportBundle({
      exportBundle,
      embeddedKey: privateKey,
      organizationId,
      returnMnemonic: true,
    });
  }
  const { encappedPublic, ciphertext } = parseBundleData(exportBundle);
  const decrypted = hpkeDecrypt({
    ciphertextBuf: hexToBytes(ciphertext),
    encappedKeyBuf: hexToBytes(encappedPublic),
    receiverPriv: privateKey,
  });
  return new TextDecoder().decode(decrypted);
}

function exportBundleFrom(retried: unknown): string {
  const v = (retried as Record<string, unknown>)?.encryptedWalletCredentials;
  if (typeof v !== "string" || !v)
    throw new Error("Export response missing encryptedWalletCredentials.");
  return v;
}

export interface ExportWalletResult extends GuidedRetryResult {
  mnemonic: string;
}

// Run the guided export, then decrypt the sealed bundle with the matching
// private key (kept client-side, never sent) to recover the wallet mnemonic.
export async function exportWallet(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
): Promise<ExportWalletResult> {
  const path = `/internal-accounts/${encodeURIComponent(accountId)}/export`;
  // The enclave encrypts the exported mnemonic to this client key; the matching
  // private key stays here and decrypts the returned bundle.
  const keyPair = generateP256KeyPair();
  const body = { clientPublicKey: keyPair.publicKeyUncompressed };
  const result = await runGuidedRetry(
    reporter,
    auth,
    "Wallet Export",
    () => apiPost(auth, path, body).then((r) => r.data),
    (headers) => apiPost(auth, path, body, headers),
  );
  const mnemonic = await recoverMnemonic(
    auth,
    exportBundleFrom(result.retried),
    keyPair.privateKey,
  );
  return { ...result, mnemonic };
}

// ----- List -----

export async function listCredentials(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
): Promise<unknown> {
  const data = await apiGet(
    auth,
    `/auth/credentials?accountId=${encodeURIComponent(accountId)}`,
  );
  reporter.log({ level: "response", label: "List Credentials", detail: data });
  return data;
}

export async function listSessions(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
): Promise<unknown> {
  const data = await apiGet(
    auth,
    `/auth/sessions?accountId=${encodeURIComponent(accountId)}`,
  );
  reporter.log({ level: "response", label: "List Sessions", detail: data });
  return data;
}
