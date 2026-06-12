// Session state — the ONE place that holds the client keypair / encrypted
// session-signing-key bundle / TEK, plus the account / credential / session
// ids. Renders the session status chip so the two session models are visible
// (and the "No client keypair" trap is surfaced as disabled-with-tooltip
// instead of a runtime throw).
//
// Two session models funnel through here:
//   - "Verify-bundle": a client keypair + an `encryptedSessionSigningKey`
//     bundle Grid returns on passkey/oauth Verify, HPKE-decrypted on demand.
//   - "OTP-TEK": the TEK private key *is* the session key (OTP login, and —
//     post-migration — passkey/oauth too); cached directly, no bundle.

import { decryptCredentialBundle, getPublicKey } from "@turnkey/crypto";

import { el, maybeEl } from "./ui";

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

let clientKeyPair: ClientKeyPair | null = null;
let lastEncryptedSessionSigningKey: string | null = null;
let cachedSessionKeys: SessionKeys | null = null;
let model: SessionModel = "none";

// ----- Client keypair (Verify-bundle model) -----

export function setClientKeyPair(kp: ClientKeyPair): void {
  clientKeyPair = kp;
  // A fresh client key invalidates any session decrypted under the old one.
  cachedSessionKeys = null;
  lastEncryptedSessionSigningKey = null;
  model = "none";
  renderChip();
}

export function getClientKeyPair(): ClientKeyPair | null {
  return clientKeyPair;
}

export function rememberEncryptedSessionSigningKey(value: unknown): void {
  // MIGRATION (P6): once the login-family knob is ON, passkey/oauth Verify drop
  // `encryptedSessionSigningKey` and behave like OTP (the client key is the
  // session key). Shape-detection on field-presence already no-ops here when
  // the field is absent, so both knob states work unchanged.
  if (typeof value === "string" && value) {
    lastEncryptedSessionSigningKey = value;
    cachedSessionKeys = null;
    model = "verify-bundle";
    renderChip();
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
  cachedSessionKeys = {
    apiPublicKey: tek.publicKey,
    apiPrivateKey: tek.privateKey,
  };
  model = "otp-tek";
  renderChip();
}

// Resolve the session signing keys, decrypting the Verify bundle on demand.
// Returns null (rather than throwing) when no session is established yet — the
// caller decides how to surface that. Crypto callers use this; UI gates use
// `hasSessionSigningKey()`.
export function resolveSessionKeys(): SessionKeys | null {
  if (cachedSessionKeys) return cachedSessionKeys;
  if (!clientKeyPair || !lastEncryptedSessionSigningKey) return null;
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

// True once a signing key is available *or* derivable (cached TEK, or a client
// keypair + bundle). This is the gate the UI uses to enable/disable buttons.
export function hasSessionSigningKey(): boolean {
  if (cachedSessionKeys) return true;
  return Boolean(clientKeyPair && lastEncryptedSessionSigningKey);
}

export function getSessionModel(): SessionModel {
  return model;
}

// ----- Change subscribers -----
//
// Buttons that need a live session (e.g. "Add passkey" retry in production)
// subscribe here so they can re-evaluate their disabled-with-tooltip state
// whenever the session changes — surfacing the requirement instead of throwing
// on click.

type SessionListener = () => void;
const listeners: SessionListener[] = [];

// Subscribe to *signing-key readiness* changes only. Listeners are notified
// when `hasSessionSigningKey()` transitions, not on every account/credential/
// session id update — so a gated button can't be re-enabled mid-flight by an
// unrelated id write (e.g. `setSessionId`) while its handler is running.
export function onSessionChange(listener: SessionListener): void {
  listeners.push(listener);
  listener(); // run once so the initial state is applied
}

let lastSigningKeyReady = false;

// Repaint the chip on any state change, but only fire listeners when
// signing-key readiness actually flips (the single thing they depend on).
function notifyIfSigningKeyChanged(): void {
  const ready = hasSessionSigningKey();
  if (ready === lastSigningKeyReady) return;
  lastSigningKeyReady = ready;
  for (const listener of listeners) listener();
}

// ----- Cross-flow ids (account / credential / session) -----
//
// Backed by the existing hidden-ish context inputs so manual paste still works;
// reading them here keeps the chip in sync with whatever the flows last set.

function accountIdEl(): HTMLInputElement {
  return el<HTMLInputElement>("ctx-account-id");
}
function credentialIdEl(): HTMLInputElement {
  return el<HTMLInputElement>("ctx-credential-id");
}
function sessionIdEl(): HTMLInputElement {
  return el<HTMLInputElement>("ctx-session-id");
}

// First-call-wins by design: the account id is established once (Create
// Customer) and shared across every credential-type tab, so a later per-type
// flow can't clobber it. Credential/session ids below are per-type and do
// overwrite. To switch accounts, clear the field in the UI.
export function setAccountId(id: string): void {
  if (!accountIdEl().value) accountIdEl().value = id;
  renderChip();
}
export function setCredentialId(id: string): void {
  credentialIdEl().value = id;
  renderChip();
}
export function setSessionId(id: string): void {
  sessionIdEl().value = id;
  renderChip();
}

export function getAccountId(): string {
  return accountIdEl().value.trim();
}
export function getCredentialId(): string {
  return credentialIdEl().value.trim();
}
export function getSessionId(): string {
  return sessionIdEl().value.trim();
}

// ----- Status chip -----

const MODEL_LABEL: Record<SessionModel, string> = {
  none: "—",
  "otp-tek": "OTP-TEK",
  "verify-bundle": "Verify-bundle",
};

// Escape interpolated values: chip fields show server-sourced ids
// (credential / session / account), so a hostile value like
// `<img src=x onerror=...>` must not become live markup in innerHTML.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chipField(label: string, value: string, ok?: boolean): string {
  const cls = ok === undefined ? "" : ok ? " chip-ok" : " chip-none";
  const shown = escapeHtml(value || "—");
  return `<span class="chip-field${cls}"><span class="chip-key">${escapeHtml(
    label,
  )}</span> ${shown}</span>`;
}

export function renderChip(): void {
  const chip = maybeEl<HTMLDivElement>("session-chip");
  if (chip) {
    const ready = hasSessionSigningKey();
    chip.innerHTML = [
      chipField("account", getAccountId()),
      chipField("credential", getCredentialId()),
      chipField("session", getSessionId()),
      chipField("signing key", ready ? "ready" : "none", ready),
      chipField("model", MODEL_LABEL[model]),
    ].join("");
  }
  // Repaint above happens on every state change; listeners only fire when the
  // signing-key readiness flips.
  notifyIfSigningKeyChanged();
}
