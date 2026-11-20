// EVM_WALLET lifecycle: first credential, sign-in, add from a live session, and
// adding another owner as an administrator.
//
// DOM-free operation functions. The wallet only signs Grid's messages with
// `personal_sign`; every approval Grid asks of an existing credential is
// stamped with the active P-256 session key, as for the other credential types.

import { generateP256KeyPair } from "@turnkey/crypto";

import { apiPost, type ApiAuth } from "../api-client";
import {
  adminReferenceFor,
  OWNER_KEY_MESSAGE,
  recoverCompressedPublicKey,
  type EvmSigner,
} from "../evm-wallet";
import type { Reporter } from "../lib/reporter";
import { adoptSessionFor, setCredentialIdFor } from "../session";
import { assertStampLoginPayload } from "../stamp-login-payload";
import { turnkeyStamp } from "../turnkey";

const CREDENTIALS_PATH = "/auth/credentials";
const ADMIN_CREDENTIALS_PATH = "/auth/admin-credentials";

const SETTLE_FIRST_DELAY_MS = 500;
const SETTLE_MAX_DELAY_MS = 8_000;
const SETTLE_DEADLINE_MS = 120_000;

type ApiResponse = { status: number; data: unknown };

interface SignedChallenge {
  payloadToSign: string;
  requestId: string;
}

function expectStatus(label: string, res: ApiResponse, status: number): void {
  if (res.status !== status)
    throw new Error(
      `${label}: expected HTTP ${status}, got ${res.status}: ${JSON.stringify(
        res.data,
      )}`,
    );
}

function challengeFrom(label: string, data: unknown): SignedChallenge {
  const d = (data ?? {}) as Record<string, unknown>;
  if (typeof d.payloadToSign !== "string" || typeof d.requestId !== "string")
    throw new Error(`${label}: no payloadToSign / requestId in the response.`);
  return { payloadToSign: d.payloadToSign, requestId: d.requestId };
}

function idFrom(label: string, data: unknown): string {
  const id = (data as Record<string, unknown> | null)?.id;
  if (typeof id !== "string" || !id)
    throw new Error(`${label}: the response has no id.`);
  return id;
}

function logResponse(reporter: Reporter, label: string, res: ApiResponse) {
  reporter.log({
    level: "response",
    label,
    detail: { status: res.status, ...(res.data as object | null) },
  });
}

function isProcessing(res: ApiResponse): boolean {
  return (
    res.status === 200 &&
    (res.data as { status?: unknown } | null)?.status === "PROCESSING"
  );
}

// A signed retry can answer `200 { status: "PROCESSING" }` while Grid finishes
// the operation. Grid matches a re-send of the identical request to the
// operation in flight, so this re-sends the same headers rather than restamping.
async function postUntilSettled(
  reporter: Reporter,
  label: string,
  auth: ApiAuth,
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
): Promise<ApiResponse> {
  const deadline = Date.now() + SETTLE_DEADLINE_MS;
  for (
    let delayMs = SETTLE_FIRST_DELAY_MS;
    ;
    delayMs = Math.min(delayMs * 2, SETTLE_MAX_DELAY_MS)
  ) {
    const res = await apiPost(auth, path, body, headers);
    logResponse(reporter, label, res);
    if (!isProcessing(res)) return res;
    if (Date.now() + delayMs > deadline)
      throw new Error(
        `${label}: still PROCESSING after ${SETTLE_DEADLINE_MS / 1000}s.`,
      );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// Stamp a 202's payloadToSign with the active session key and send the signed
// retry. Grid only accepts P-256 stamps in Grid-Wallet-Signature, so the
// session key signs approvals even for an EVM wallet's account.
async function approveWithSession(
  reporter: Reporter,
  label: string,
  auth: ApiAuth,
  path: string,
  body: Record<string, unknown>,
  challenge: unknown,
): Promise<ApiResponse> {
  const { payloadToSign, requestId } = challengeFrom(label, challenge);
  const signature = await turnkeyStamp(payloadToSign);
  return postUntilSettled(reporter, label, auth, path, body, {
    "Grid-Wallet-Signature": signature,
    "Request-Id": requestId,
  });
}

// ----- Registration: ownership challenge + proof -----

// The first two calls of every EVM_WALLET registration. The proof's response
// depends on the account: 201 creates a wallet-less account's wallet, and 202
// asks an existing session to approve the add.
async function proveOwnership(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  signer: EvmSigner,
): Promise<{ body: Record<string, unknown>; proof: ApiResponse }> {
  const body = { type: "EVM_WALLET", accountId, address: signer.address };
  const challenge = await apiPost(auth, CREDENTIALS_PATH, body);
  logResponse(reporter, "EVM_WALLET ownership challenge", challenge);
  expectStatus("EVM_WALLET ownership challenge", challenge, 202);
  const { payloadToSign, requestId } = challengeFrom(
    "EVM_WALLET ownership challenge",
    challenge.data,
  );
  const ownershipSignature = await signer.signMessage(payloadToSign);
  const proof = await postUntilSettled(
    reporter,
    "EVM_WALLET ownership proof",
    auth,
    CREDENTIALS_PATH,
    body,
    {
      "Grid-Wallet-Ownership-Signature": ownershipSignature,
      "Request-Id": requestId,
    },
  );
  return { body, proof };
}

/** The account's first credential: on a `PENDING` account the proof creates the wallet. */
export async function createEvmWalletFirstCredential(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  signer: EvmSigner,
): Promise<string> {
  const { proof } = await proveOwnership(reporter, auth, accountId, signer);
  expectStatus("EVM_WALLET first credential", proof, 201);
  const credId = idFrom("EVM_WALLET first credential", proof.data);
  setCredentialIdFor(accountId, credId);
  return credId;
}

/** Add an EVM wallet to an account with a wallet: ownership proof, then session approval. */
export async function addEvmWallet(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  signer: EvmSigner,
): Promise<unknown> {
  const { body, proof } = await proveOwnership(
    reporter,
    auth,
    accountId,
    signer,
  );
  expectStatus("EVM_WALLET ownership proof", proof, 202);
  const approval = await approveWithSession(
    reporter,
    "EVM_WALLET Add (approval)",
    auth,
    CREDENTIALS_PATH,
    body,
    proof.data,
  );
  expectStatus("EVM_WALLET Add (approval)", approval, 201);
  return approval.data;
}

// ----- Sign-in -----

/**
 * `/challenge` with a fresh P-256 client key, `personal_sign` of the session
 * request, then `/verify`. The client key becomes the session signing key of
 * `accountId`, the account `credId` belongs to, so every existing signed
 * action works on this session unchanged.
 */
export async function loginEvmWallet(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  credId: string,
  signer: EvmSigner,
): Promise<unknown> {
  const sessionKey = generateP256KeyPair();
  const base = `${CREDENTIALS_PATH}/${encodeURIComponent(credId)}`;
  const challenge = await apiPost(auth, `${base}/challenge`, {
    clientPublicKey: sessionKey.publicKey,
  });
  logResponse(reporter, "EVM_WALLET Challenge", challenge);
  expectStatus("EVM_WALLET Challenge", challenge, 200);
  const { payloadToSign, requestId } = challengeFrom(
    "EVM_WALLET Challenge",
    challenge.data,
  );
  assertStampLoginPayload(payloadToSign, sessionKey.publicKey);
  const signature = await signer.signMessage(payloadToSign);
  const verify = await postUntilSettled(
    reporter,
    "EVM_WALLET Verify",
    auth,
    `${base}/verify`,
    { type: "EVM_WALLET", signature },
    { "Request-Id": requestId },
  );
  expectStatus("EVM_WALLET Verify", verify, 200);
  adoptSessionFor(
    accountId,
    idFrom("EVM_WALLET Verify", verify.data),
    sessionKey,
  );
  return verify.data;
}

// ----- Another owner (administrator) -----

/**
 * Add `newOwner`'s wallet as an administrator credential. The wallet signs a
 * fixed message so its public key can be recovered. Both approvals are
 * stamped with the active session key: the first creates the administrator's
 * wallet user and the second grants it signing authority.
 */
export async function addEvmAdministrator(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  newOwner: EvmSigner,
): Promise<unknown> {
  const keySignature = await newOwner.signMessage(OWNER_KEY_MESSAGE);
  const publicKey = await recoverCompressedPublicKey(
    OWNER_KEY_MESSAGE,
    keySignature,
    newOwner.address,
  );
  const body = {
    type: "EVM_WALLET",
    accountId,
    adminReference: adminReferenceFor(newOwner.address),
    publicKey,
  };
  const createUser = await apiPost(auth, ADMIN_CREDENTIALS_PATH, body);
  logResponse(reporter, "Admin EVM_WALLET (issue)", createUser);
  expectStatus("Admin EVM_WALLET (issue)", createUser, 202);
  const grant = await approveWithSession(
    reporter,
    "Admin EVM_WALLET (create user)",
    auth,
    ADMIN_CREDENTIALS_PATH,
    body,
    createUser.data,
  );
  expectStatus("Admin EVM_WALLET (create user)", grant, 202);
  const added = await approveWithSession(
    reporter,
    "Admin EVM_WALLET (grant authority)",
    auth,
    ADMIN_CREDENTIALS_PATH,
    body,
    grant.data,
  );
  expectStatus("Admin EVM_WALLET (grant authority)", added, 201);
  return added.data;
}
