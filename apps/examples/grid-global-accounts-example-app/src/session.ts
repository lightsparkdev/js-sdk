// Session state — the ONE place that holds the client keypair / encrypted
// session-signing-key bundle / TEK, plus the account / credential / session
// ids. DOM-free: it holds this state in module variables and notifies
// subscribers on change (the React layer reads it via the getters and renders
// the session chip; gated flows re-evaluate their disabled state). The two
// session models still funnel through here:
//   - "Verify-bundle": a client keypair + an `encryptedSessionSigningKey`
//     bundle Grid returns on passkey/oauth Verify, HPKE-decrypted on demand.
//   - "OTP-TEK": the TEK private key *is* the session key (OTP login, and —
//     post-migration — passkey/oauth too); cached directly, no bundle.
//
// Sessions are PER-CUSTOMER, keyed by the customer's wallet account id (the
// natural session domain). A `Map<accountId, SessionContext>` holds one context
// per customer and `activeKey` points at the active customer's context, so
// acting as customer A then B never lets B inherit A's keys. All exported
// getters/setters operate on the *active* context; `setActiveSessionAccount`
// switches which context is active (creating an empty one for a new key, or
// `null` for logged-out / no active customer).

import { decryptCredentialBundle, getPublicKey } from "@turnkey/crypto";

export interface ClientKeyPair {
  privateKey: string; // hex
  publicKey: string; // hex, compressed
  publicKeyUncompressed: string; // hex, 130 chars (0x04 prefix)
}

export interface SessionKeys {
  apiPublicKey: string; // hex, compressed P-256
  apiPrivateKey: string; // hex
}

// Which model established the current signing key, for the chip badge.
export type SessionModel = "none" | "otp-tek" | "verify-bundle";

// All the per-customer session material, grouped so each account key owns an
// independent copy.
interface SessionContext {
  clientKeyPair: ClientKeyPair | null;
  lastEncryptedSessionSigningKey: string | null;
  cachedSessionKeys: SessionKeys | null;
  model: SessionModel;
  accountId: string;
  credentialId: string;
  sessionId: string;
}

function emptyContext(): SessionContext {
  return {
    clientKeyPair: null,
    lastEncryptedSessionSigningKey: null,
    cachedSessionKeys: null,
    model: "none",
    accountId: "",
    credentialId: "",
    sessionId: "",
  };
}

const contexts = new Map<string, SessionContext>();
let activeKey: string | null = null;

// The active context, or null when no customer is active (logged-out). Getters
// fall back to an empty context's defaults; mutators no-op when null.
function active(): SessionContext | null {
  if (activeKey === null) return null;
  return contexts.get(activeKey) ?? null;
}

// ----- Active-context switching -----
//
// Point the session at a customer's account. A new key gets a fresh empty
// context (logged-out); `null` means no active customer (logged-out, no
// context). Notifies subscribers since the visible session changes.
export function setActiveSessionAccount(accountId: string | null): void {
  if (accountId === null) {
    activeKey = null;
    notify();
    return;
  }
  if (!contexts.has(accountId)) contexts.set(accountId, emptyContext());
  activeKey = accountId;
  notify();
}

// Wipe the active context's signing material (keys / model / ids) so
// `hasSessionSigningKey()` is false and `getSessionModel()` is "none", while
// keeping the account id so the slot still belongs to this customer. Used when
// the session this client holds is revoked: the customer stays selected but is
// logged out locally and can re-authenticate. No-op when logged out.
export function clearActiveSession(): void {
  const ctx = active();
  if (!ctx) return;
  ctx.clientKeyPair = null;
  ctx.lastEncryptedSessionSigningKey = null;
  ctx.cachedSessionKeys = null;
  ctx.model = "none";
  ctx.credentialId = "";
  ctx.sessionId = "";
  notify();
}

// ----- Client keypair (Verify-bundle model) -----

export function setClientKeyPair(kp: ClientKeyPair): void {
  const ctx = active();
  if (!ctx) return;
  ctx.clientKeyPair = kp;
  // A fresh client key invalidates any session decrypted under the old one.
  ctx.cachedSessionKeys = null;
  ctx.lastEncryptedSessionSigningKey = null;
  ctx.model = "none";
  notify();
}

export function getClientKeyPair(): ClientKeyPair | null {
  return active()?.clientKeyPair ?? null;
}

export function rememberEncryptedSessionSigningKey(value: unknown): void {
  // MIGRATION (P6): once the login-family knob is ON, passkey/oauth Verify drop
  // `encryptedSessionSigningKey` and behave like OTP (the client key is the
  // session key). Shape-detection on field-presence already no-ops here when
  // the field is absent, so both knob states work unchanged.
  const ctx = active();
  if (!ctx) return;
  if (typeof value === "string" && value) {
    ctx.lastEncryptedSessionSigningKey = value;
    ctx.cachedSessionKeys = null;
    ctx.model = "verify-bundle";
    notify();
  }
}

// ----- OTP-TEK model -----
//
// There is no encryptedSessionSigningKey bundle — the TEK private key *is* the
// session's API key once login registers it. Cache it directly so
// `turnkeyStamp` can authorize later signed retries without the Verify-style
// clientKeyPair + bundle.
export function setSessionKeysFromTek(tek: {
  publicKey: string;
  privateKey: string;
}): void {
  const ctx = active();
  if (!ctx) return;
  ctx.cachedSessionKeys = {
    apiPublicKey: tek.publicKey,
    apiPrivateKey: tek.privateKey,
  };
  ctx.model = "otp-tek";
  notify();
}

// Resolve the session signing keys, decrypting the Verify bundle on demand.
// Returns null (rather than throwing) when no session is established yet — the
// caller decides how to surface that. Crypto callers use this; UI gates use
// `hasSessionSigningKey()`.
export function resolveSessionKeys(): SessionKeys | null {
  const ctx = active();
  if (!ctx) return null;
  if (ctx.cachedSessionKeys) return ctx.cachedSessionKeys;
  if (!ctx.clientKeyPair || !ctx.lastEncryptedSessionSigningKey) return null;
  const apiPrivateKey = decryptCredentialBundle(
    ctx.lastEncryptedSessionSigningKey,
    ctx.clientKeyPair.privateKey,
  );
  const apiPublicKeyBytes = getPublicKey(apiPrivateKey, /*isCompressed*/ true);
  const apiPublicKey = Array.from(apiPublicKeyBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  ctx.cachedSessionKeys = { apiPublicKey, apiPrivateKey };
  return ctx.cachedSessionKeys;
}

// True once a signing key is available *or* derivable (cached TEK, or a client
// keypair + bundle). This is the gate the UI uses to enable/disable buttons.
export function hasSessionSigningKey(): boolean {
  const ctx = active();
  if (!ctx) return false;
  if (ctx.cachedSessionKeys) return true;
  return Boolean(ctx.clientKeyPair && ctx.lastEncryptedSessionSigningKey);
}

export function getSessionModel(): SessionModel {
  return active()?.model ?? "none";
}

// ----- Change subscribers -----
//
// Buttons / views that need a live session (e.g. "Add passkey" retry in
// production) subscribe here so they can re-evaluate their disabled-with-tooltip
// state whenever the session changes — surfacing the requirement instead of
// throwing on click. Subscribers are notified on any active-context change AND
// on an active-key switch.

type SessionListener = () => void;
const listeners: SessionListener[] = [];

export function onSessionChange(listener: SessionListener): void {
  listeners.push(listener);
  listener(); // run once so the initial state is applied
}

function notify(): void {
  for (const listener of listeners) listener();
}

// ----- Cross-flow ids (account / credential / session) -----
//
// Held per-context; the React layer reads them via the getters to render the
// context chip and re-fires gates through `notify()` when they change.

export function setAccountId(id: string): void {
  const ctx = active();
  if (!ctx) return;
  // Match the original behaviour: only adopt the first account id seen, so a
  // later flow doesn't clobber the customer's primary account.
  if (!ctx.accountId) ctx.accountId = id;
  notify();
}
export function setCredentialId(id: string): void {
  const ctx = active();
  if (!ctx) return;
  ctx.credentialId = id;
  notify();
}
export function setSessionId(id: string): void {
  const ctx = active();
  if (!ctx) return;
  ctx.sessionId = id;
  notify();
}

export function getAccountId(): string {
  return (active()?.accountId ?? "").trim();
}
export function getCredentialId(): string {
  return (active()?.credentialId ?? "").trim();
}
export function getSessionId(): string {
  return (active()?.sessionId ?? "").trim();
}
