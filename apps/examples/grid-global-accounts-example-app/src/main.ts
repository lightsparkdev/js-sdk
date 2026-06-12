// Grid Global Accounts — Example App
//
// Tabbed lifecycle per credential type (EMAIL_OTP / OAUTH / PASSKEY) +
// shared customer / external account / quote / execute sections.
// Signed-retry flows are two-step: issue (returns 202 challenge) then retry
// (forwards with `Grid-Wallet-Signature: sandbox-valid-signature`).

import {
  decryptCredentialBundle,
  formatHpkeBuf,
  generateP256KeyPair,
  getPublicKey,
  hpkeEncrypt,
} from "@turnkey/crypto";
import { signWithApiKey } from "@turnkey/api-key-stamper";

type Mode = "sandbox" | "production";
type CredType = "email_otp" | "oauth" | "passkey";

const SANDBOX_SIG = "sandbox-valid-signature";
// All requests proxy through Vite at `/api` and forward to prod.
// Credentials are entered manually in the UI — never embedded.
const API_BASE = "/api";

// Turnkey API stamp scheme — must match what `@turnkey/api-key-stamper` emits.
const TURNKEY_STAMP_SCHEME = "SIGNATURE_SCHEME_TK_API_P256";

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

interface ClientKeyPair {
  privateKey: string; // hex
  publicKey: string; // hex, compressed
  publicKeyUncompressed: string; // hex, 130 chars (0x04 prefix)
}

interface SessionKeys {
  apiPublicKey: string; // hex, compressed P-256
  apiPrivateKey: string; // hex
}

let clientKeyPair: ClientKeyPair | null = null;
let lastEncryptedSessionSigningKey: string | null = null;
let cachedSessionKeys: SessionKeys | null = null;

function generateClientKeyPair(): ClientKeyPair {
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

function rememberEncryptedSessionSigningKey(value: unknown): void {
  if (typeof value === "string" && value) {
    lastEncryptedSessionSigningKey = value;
    cachedSessionKeys = null;
  }
}

// OTP_LOGIN / STAMP_LOGIN model: there is no encryptedSessionSigningKey bundle
// — the TEK private key *is* the session's API key once login registers it.
// Cache it directly so turnkeyStamp() can authorize later signed retries
// (e.g. adding a passkey) without the Verify-style clientKeyPair + bundle.
function setSessionKeysFromTek(tek: {
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
    throw new Error("No client keypair — run a Verify in production mode first.");
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

async function turnkeyStamp(payload: string): Promise<string> {
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

function sealOtpBundle(
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
async function buildWalletSignature(
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

// ----- DOM helpers -----

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element #${id}`);
  return found as T;
}

function maybeEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// ----- Auth / HTTP / Mode -----

const authClientId = el<HTMLInputElement>("auth-client-id");
const authClientSecret = el<HTMLInputElement>("auth-client-secret");
const modeSelect = el<HTMLSelectElement>("mode-select");

function getMode(): Mode {
  return modeSelect.value === "production" ? "production" : "sandbox";
}

function getAuthHeader(): string {
  return "Basic " + btoa(`${authClientId.value.trim()}:${authClientSecret.value.trim()}`);
}

async function apiPost(
  path: string,
  body: Record<string, unknown> | undefined,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

async function apiDelete(
  path: string,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: {
      Authorization: getAuthHeader(),
      ...extraHeaders,
    },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

async function apiPatch(
  path: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(API_BASE + path, {
    headers: { Authorization: getAuthHeader() },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return data;
}

// ----- Logging -----

const logContainer = el<HTMLDivElement>("log");

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function addLog(label: string, data: unknown): void {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const ts = document.createElement("span");
  ts.className = "log-ts";
  ts.textContent = timestamp();
  const lbl = document.createElement("span");
  lbl.className = "log-label";
  lbl.textContent = `[${label}]`;
  const body = document.createTextNode(`\n${JSON.stringify(data, null, 2)}`);
  entry.append(ts, " ", lbl, body);
  logContainer.prepend(entry);
}

function showStatus(el: HTMLDivElement, ok: boolean, text: string): void {
  el.className = `status ${ok ? "ok" : "err"}`;
  el.textContent = text;
}

// ----- Context (cross-tab) -----

const ctxAccountId = el<HTMLInputElement>("ctx-account-id");
const ctxCredentialId = el<HTMLInputElement>("ctx-credential-id");
const ctxSessionId = el<HTMLInputElement>("ctx-session-id");

function setCtxAccount(id: string): void {
  if (!ctxAccountId.value) ctxAccountId.value = id;
}
function setCtxCredential(id: string): void {
  ctxCredentialId.value = id;
}
function setCtxSession(id: string): void {
  ctxSessionId.value = id;
}

// ----- Generic click wrapper -----

function bindClick(
  btnId: string,
  statusId: string,
  label: string,
  runningText: string,
  handler: () => Promise<string>,
): void {
  const btn = maybeEl<HTMLButtonElement>(btnId);
  const statusEl = maybeEl<HTMLDivElement>(statusId);
  if (!btn || !statusEl) {
    console.warn(`bindClick: missing btn=${btnId} or status=${statusId}`);
    return;
  }
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    showStatus(statusEl, true, runningText);
    try {
      const responseText = await handler();
      showStatus(statusEl, true, responseText);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`${label} Error`, { error: msg });
      showStatus(statusEl, false, msg);
    } finally {
      btn.disabled = false;
    }
  });
}

// ----- Key generation helper -----
//
// All "Generate P-256 Key" buttons share the same module-level
// `clientKeyPair` so a session decrypted under one keypair stays valid
// across tabs. The button writes the uncompressed public key into the
// target field — that's what Grid's `clientPublicKey` API expects.

function wireGenKeyButton(btnId: string, targetInputId: string): void {
  const btn = maybeEl<HTMLButtonElement>(btnId);
  const target = maybeEl<HTMLInputElement>(targetInputId);
  if (!btn || !target) return;
  btn.addEventListener("click", () => {
    btn.disabled = true;
    try {
      const kp = generateClientKeyPair();
      target.value = kp.publicKeyUncompressed;
      addLog("Key Generated", {
        publicKeyUncompressed: kp.publicKeyUncompressed,
      });
    } catch (err) {
      addLog("Key Generation Error", { error: String(err) });
    } finally {
      btn.disabled = false;
    }
  });
}

// ----- Tab switching -----

for (const tabBtn of document.querySelectorAll<HTMLButtonElement>(".tab")) {
  tabBtn.addEventListener("click", () => {
    const name = tabBtn.dataset.tab!;
    document
      .querySelectorAll<HTMLButtonElement>(".tab")
      .forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document
      .querySelectorAll<HTMLDivElement>(".tab-panel")
      .forEach((p) => p.classList.toggle("active", p.dataset.panel === name));
  });
}

// ==========================================================
// Shared setup: Create customer + Fetch balance
// ==========================================================

const createPlatformCustomerId = el<HTMLInputElement>("create-platform-customer-id");
const createCustomerName = el<HTMLInputElement>("create-customer-name");
const createCustomerEmail = el<HTMLInputElement>("create-customer-email");
const balanceCustomerId = el<HTMLInputElement>("balance-customer-id");

bindClick(
  "btn-create-customer",
  "create-customer-status",
  "Create Customer",
  "Creating customer...",
  async () => {
    const platformCustomerId =
      createPlatformCustomerId.value.trim() || `test-${Date.now()}`;
    const fullName = createCustomerName.value.trim() || "Test User";
    const email = createCustomerEmail.value.trim();
    const body: Record<string, unknown> = {
      customerType: "BUSINESS",
      platformCustomerId,
      region: "US",
      currencies: ["USDB"],
      businessInfo: {
        legalName: fullName,
        taxId: "12-3456789",
        incorporatedOn: "2020-01-01",
      },
    };
    if (email) body.email = email;
    const { data: customer } = await apiPost("/customers", body);
    addLog("Create Customer", customer);
    const customerId = (customer as Record<string, unknown>).id as string;
    if (!balanceCustomerId.value) balanceCustomerId.value = customerId;
    const accounts = (await apiGet(
      `/customers/internal-accounts?customerId=${customerId}&currency=USDB`,
    )) as { data: Array<{ id: string }> };
    addLog("Internal Accounts", accounts);
    if (accounts.data && accounts.data.length > 0) {
      setCtxAccount(accounts.data[0].id);
      return `Customer: ${customerId}\nAccount: ${accounts.data[0].id}\nEmbedded wallet pre-created at customer-create time.`;
    }
    return `Customer: ${customerId}\nNo USDB account found yet — wallet provisioning may be in progress.`;
  },
);

// ==========================================================
// Platform config (OTP + branding) — GET to populate, PATCH to save
// ==========================================================

const cfgAppName = maybeEl<HTMLInputElement>("cfg-app-name");
const cfgOtpLength = maybeEl<HTMLInputElement>("cfg-otp-length");
const cfgAlphanumeric = maybeEl<HTMLInputElement>("cfg-alphanumeric");
const cfgExpirationSeconds = maybeEl<HTMLInputElement>("cfg-expiration-seconds");
const cfgSendFromEmail = maybeEl<HTMLInputElement>("cfg-send-from-email");
const cfgSendFromName = maybeEl<HTMLInputElement>("cfg-send-from-name");
const cfgReplyToEmail = maybeEl<HTMLInputElement>("cfg-reply-to-email");
const cfgLogoUrl = maybeEl<HTMLInputElement>("cfg-logo-url");

function readConfigForm(): Record<string, unknown> {
  // Only include fields the user touched (non-empty) so we PATCH a real partial.
  const ewc: Record<string, unknown> = {};
  if (cfgAppName?.value.trim()) ewc.appName = cfgAppName.value.trim();
  if (cfgOtpLength?.value.trim())
    ewc.otpLength = parseInt(cfgOtpLength.value, 10);
  if (cfgAlphanumeric) ewc.alphanumeric = cfgAlphanumeric.checked;
  if (cfgExpirationSeconds?.value.trim())
    ewc.expirationSeconds = parseInt(cfgExpirationSeconds.value, 10);
  if (cfgSendFromEmail?.value.trim())
    ewc.sendFromEmailAddress = cfgSendFromEmail.value.trim();
  if (cfgSendFromName?.value.trim())
    ewc.sendFromEmailSenderName = cfgSendFromName.value.trim();
  if (cfgReplyToEmail?.value.trim())
    ewc.replyToEmailAddress = cfgReplyToEmail.value.trim();
  if (cfgLogoUrl?.value.trim()) ewc.logoUrl = cfgLogoUrl.value.trim();
  return { embeddedWalletConfig: ewc };
}

function applyConfigToForm(cfg: unknown): void {
  const ewc = (cfg as { embeddedWalletConfig?: Record<string, unknown> })
    ?.embeddedWalletConfig;
  if (!ewc) return;
  if (cfgAppName && typeof ewc.appName === "string") cfgAppName.value = ewc.appName;
  if (cfgOtpLength && typeof ewc.otpLength === "number")
    cfgOtpLength.value = String(ewc.otpLength);
  if (cfgAlphanumeric && typeof ewc.alphanumeric === "boolean")
    cfgAlphanumeric.checked = ewc.alphanumeric;
  if (cfgExpirationSeconds && typeof ewc.expirationSeconds === "number")
    cfgExpirationSeconds.value = String(ewc.expirationSeconds);
  if (cfgSendFromEmail && typeof ewc.sendFromEmailAddress === "string")
    cfgSendFromEmail.value = ewc.sendFromEmailAddress;
  if (cfgSendFromName && typeof ewc.sendFromEmailSenderName === "string")
    cfgSendFromName.value = ewc.sendFromEmailSenderName;
  if (cfgReplyToEmail && typeof ewc.replyToEmailAddress === "string")
    cfgReplyToEmail.value = ewc.replyToEmailAddress;
  if (cfgLogoUrl && typeof ewc.logoUrl === "string") cfgLogoUrl.value = ewc.logoUrl;
}

bindClick("btn-cfg-load", "cfg-status", "Load Config", "Loading…", async () => {
  const cfg = await apiGet("/config");
  addLog("GET /config", cfg);
  applyConfigToForm(cfg);
  return "Config loaded into form.";
});

bindClick("btn-cfg-save", "cfg-status", "Save Config", "Saving…", async () => {
  const body = readConfigForm();
  const { data } = await apiPatch("/config", body);
  addLog("PATCH /config", data);
  return "Config saved.";
});

bindClick(
  "btn-fetch-balance",
  "balance-status",
  "Fetch Balance",
  "Fetching balance...",
  async () => {
    const customerId = balanceCustomerId.value.trim();
    if (!customerId) throw new Error("Customer ID is required.");
    const data = (await apiGet(
      `/customers/internal-accounts?customerId=${encodeURIComponent(customerId)}`,
    )) as { data: Array<Record<string, unknown>> };
    addLog("Fetch Balance", data);
    return JSON.stringify(
      data.data?.map((a) => ({ id: a.id, currency: a.currency, balance: a.balance })) ??
        [],
      null,
      2,
    );
  },
);

// ==========================================================
// Per-type lifecycle
// ==========================================================

function requireAccountId(): string {
  const id = ctxAccountId.value.trim();
  if (!id)
    throw new Error("Internal Account ID is required — run Create Customer first.");
  return id;
}

function requireCredentialId(): string {
  const id = ctxCredentialId.value.trim();
  if (!id) throw new Error("Credential ID is required — run Create for this type first.");
  return id;
}

function requireSessionId(): string {
  const id = ctxSessionId.value.trim();
  if (!id) throw new Error("Session ID is required — run Verify for this type first.");
  return id;
}

// ----- EMAIL_OTP -----

bindClick(
  "btn-email_otp-create",
  "email_otp-create-status",
  "EMAIL_OTP Create",
  "Registering EMAIL_OTP credential...",
  async () => {
    const { data } = await apiPost("/auth/credentials", {
      type: "EMAIL_OTP",
      accountId: requireAccountId(),
    });
    addLog("EMAIL_OTP Create", data);
    const d = data as Record<string, unknown>;
    if (d.id) setCtxCredential(d.id as string);
    return JSON.stringify(data, null, 2);
  },
);

// Secure OTP — two steps so it works against real Turnkey, which emails a
// real OTP (sandbox uses the fixed 000000). Step 1 (/challenge) issues the
// INIT_OTP and returns the enclave's target bundle, held below until Verify
// consumes it. Step 2
// HPKE-seals the entered code under that bundle, runs /verify first leg
// (202 + payloadToSign), signs the token with the TEK, and runs /verify retry
// (200 session). The code never leaves the client in plaintext; the TEK private
// key stays client-side (no encryptedSessionSigningKey is returned).

// Target bundle from the most recent V3 challenge + the credential it was
// issued for, so Verify catches a stale/mismatched bundle.
let v3TargetBundle: string | null = null;
let v3TargetBundleCredId: string | null = null;

bindClick(
  "btn-email_otp-v3-challenge",
  "email_otp-v3-challenge-status",
  "EMAIL_OTP Challenge (V3)",
  "Requesting OTP...",
  async () => {
    const credId = requireCredentialId();
    const { data: challengeData } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
      {},
    );
    addLog("V3 Challenge", challengeData);
    const targetBundle = (challengeData as Record<string, unknown>)
      .otpEncryptionTargetBundle as string | undefined;
    if (!targetBundle)
      throw new Error(
        "Challenge response missing otpEncryptionTargetBundle — is the local " +
          "backend running the secure-OTP branch?",
      );
    v3TargetBundle = targetBundle;
    v3TargetBundleCredId = credId;
    return "OTP sent. Check the customer's email, enter the code below, then Verify.";
  },
);

bindClick(
  "btn-email_otp-v3-verify",
  "email_otp-v3-verify-status",
  "EMAIL_OTP Verify (V3)",
  "Verifying...",
  async () => {
    const credId = requireCredentialId();
    const otp = el<HTMLInputElement>("email_otp-v3-code").value.trim();
    if (!otp) throw new Error("OTP code is required.");
    if (!v3TargetBundle || v3TargetBundleCredId !== credId)
      throw new Error(
        "Run Challenge (V3) first to request an OTP + target bundle for this " +
          "credential.",
      );

    // Generate a TEK and HPKE-seal the entered OTP under the challenge bundle.
    const tek = generateP256KeyPair();
    const encryptedOtpBundle = sealOtpBundle(v3TargetBundle, tek.publicKey, otp);

    // First leg → expect 202 with payloadToSign (verificationToken) + requestId.
    const leg1 = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/verify`,
      { type: "EMAIL_OTP", encryptedOtpBundle },
    );
    const l1 = (leg1.data ?? {}) as Record<string, unknown>;
    addLog("V3 Verify leg 1 (expect 202)", { status: leg1.status, ...l1 });
    const payloadToSign = l1.payloadToSign as string | undefined;
    const requestId = l1.requestId as string | undefined;
    if (leg1.status !== 202 || !payloadToSign || !requestId)
      throw new Error(`Unexpected first-leg response: ${JSON.stringify(leg1)}`);

    // Sign the verificationToken with the TEK private key.
    const signature = await buildWalletSignature(
      tek.publicKey,
      tek.privateKey,
      payloadToSign,
    );

    // Retry with the signature → expect 200 AuthSession.
    const leg2 = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/verify`,
      { type: "EMAIL_OTP", encryptedOtpBundle },
      { "Grid-Wallet-Signature": signature, "Request-Id": requestId },
    );
    const session = (leg2.data ?? {}) as Record<string, unknown>;
    addLog("V3 Verify leg 2 (expect 200 session)", {
      status: leg2.status,
      ...session,
    });
    if (session.id) setCtxSession(session.id as string);
    // The TEK is now the session's API key (OTP_LOGIN registered it). Cache it
    // as the active session signing key so later signed retries (add passkey,
    // quote execute, etc.) can stamp with this session via turnkeyStamp().
    if (leg2.status === 200) setSessionKeysFromTek(tek);
    // One bundle per challenge — force a fresh Challenge for the next run.
    v3TargetBundle = null;
    v3TargetBundleCredId = null;
    return JSON.stringify({ leg1: leg1.data, session: leg2.data }, null, 2);
  },
);

bindClick(
  "btn-email_otp-rechallenge",
  "email_otp-rechallenge-status",
  "EMAIL_OTP Rechallenge",
  "Re-issuing OTP...",
  async () => {
    const credId = requireCredentialId();
    const { data } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
      {},
    );
    addLog("EMAIL_OTP Rechallenge", data);
    return JSON.stringify(data, null, 2);
  },
);

const emailOtpAddRequestId = el<HTMLInputElement>("email_otp-add-request-id");
bindClick(
  "btn-email_otp-add-issue",
  "email_otp-add-issue-status",
  "EMAIL_OTP Add (issue)",
  "Issuing add challenge...",
  async () => {
    const { data } = await apiPost("/auth/credentials", {
      type: "EMAIL_OTP",
      accountId: requireAccountId(),
    });
    addLog("EMAIL_OTP Add (issue)", data);
    const d = data as Record<string, unknown>;
    if (d.requestId) emailOtpAddRequestId.value = d.requestId as string;
    return JSON.stringify(data, null, 2);
  },
);
bindClick(
  "btn-email_otp-add-retry",
  "email_otp-add-retry-status",
  "EMAIL_OTP Add (retry)",
  "Forwarding signed retry...",
  async () => {
    const requestId = emailOtpAddRequestId.value.trim();
    if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
    const { data } = await apiPost(
      "/auth/credentials",
      { type: "EMAIL_OTP", accountId: requireAccountId() },
      { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
    );
    addLog("EMAIL_OTP Add (retry)", data);
    return JSON.stringify(data, null, 2);
  },
);

// ----- OAUTH -----

bindClick(
  "btn-oauth-create",
  "oauth-create-status",
  "OAUTH Create",
  "Creating OAUTH wallet...",
  async () => {
    const oidc = el<HTMLTextAreaElement>("oauth-create-oidc").value.trim();
    if (!oidc) throw new Error("OIDC token is required.");
    const { data } = await apiPost("/auth/credentials", {
      type: "OAUTH",
      accountId: requireAccountId(),
      oidcToken: oidc,
    });
    addLog("OAUTH Create", data);
    const d = data as Record<string, unknown>;
    if (d.id) setCtxCredential(d.id as string);
    return JSON.stringify(data, null, 2);
  },
);

wireGenKeyButton("btn-oauth-verify-genkey", "oauth-verify-pubkey");
bindClick(
  "btn-oauth-verify",
  "oauth-verify-status",
  "OAUTH Verify",
  "Verifying...",
  async () => {
    const credId = requireCredentialId();
    const oidc = el<HTMLInputElement>("oauth-verify-oidc").value.trim();
    const pubkey = el<HTMLInputElement>("oauth-verify-pubkey").value.trim();
    if (!oidc || !pubkey) throw new Error("OIDC token and public key are required.");
    const { data } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/verify`,
      { type: "OAUTH", oidcToken: oidc, clientPublicKey: pubkey },
    );
    addLog("OAUTH Verify", data);
    const d = data as Record<string, unknown>;
    if (d.id) setCtxSession(d.id as string);
    rememberEncryptedSessionSigningKey(d.encryptedSessionSigningKey);
    return JSON.stringify(data, null, 2);
  },
);

bindClick(
  "btn-oauth-rechallenge",
  "oauth-rechallenge-status",
  "OAUTH Rechallenge",
  "Running no-op rechallenge...",
  async () => {
    const credId = requireCredentialId();
    const { data } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
      {},
    );
    addLog("OAUTH Rechallenge", data);
    return JSON.stringify(data, null, 2);
  },
);

const oauthAddRequestId = el<HTMLInputElement>("oauth-add-request-id");
bindClick(
  "btn-oauth-add-issue",
  "oauth-add-issue-status",
  "OAUTH Add (issue)",
  "Issuing add challenge...",
  async () => {
    const oidc = el<HTMLTextAreaElement>("oauth-add-oidc").value.trim();
    if (!oidc) throw new Error("OIDC token is required.");
    const { data } = await apiPost("/auth/credentials", {
      type: "OAUTH",
      accountId: requireAccountId(),
      oidcToken: oidc,
    });
    addLog("OAUTH Add (issue)", data);
    const d = data as Record<string, unknown>;
    if (d.requestId) oauthAddRequestId.value = d.requestId as string;
    return JSON.stringify(data, null, 2);
  },
);
bindClick(
  "btn-oauth-add-retry",
  "oauth-add-retry-status",
  "OAUTH Add (retry)",
  "Forwarding signed retry...",
  async () => {
    const requestId = oauthAddRequestId.value.trim();
    if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
    const oidc = el<HTMLTextAreaElement>("oauth-add-oidc").value.trim();
    const { data } = await apiPost(
      "/auth/credentials",
      { type: "OAUTH", accountId: requireAccountId(), oidcToken: oidc },
      { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
    );
    addLog("OAUTH Add (retry)", data);
    return JSON.stringify(data, null, 2);
  },
);

// ----- WebAuthn ceremony helpers (real passkeys) -----
//
// The sandbox flows accept magic placeholder strings, but a real Turnkey
// sub-org needs a genuine WebAuthn credential. These helpers drive the
// browser's authenticator (Touch ID, etc.) and base64url-encode the results
// into the same fields the sandbox flow uses, so Create / Add / Verify work
// unchanged against production Turnkey.
//
// NOTE: WebAuthn binds a credential to an RP ID that must be a suffix of the
// page origin — on localhost that means rpId="localhost". The Turnkey sub-org
// must have been created with the SAME RP ID or verification will fail.

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function passkeyRpId(): string {
  return el<HTMLInputElement>("passkey-rp-id").value.trim() || location.hostname;
}

interface RealAttestation {
  challenge: string;
  credentialId: string;
  clientDataJson: string;
  attestationObject: string;
}

// Real registration ceremony — produces the attestation that Create/Add send.
async function createRealPasskey(nickname: string): Promise<RealAttestation> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { id: passkeyRpId(), name: "Grid Example App" },
      user: {
        id: userId,
        name: nickname || "grid-example-user",
        displayName: nickname || "Grid Example User",
      },
      challenge,
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      attestation: "none",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey creation returned no credential");
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    challenge: bytesToB64Url(challenge),
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    attestationObject: bytesToB64Url(new Uint8Array(response.attestationObject)),
  };
}

interface RealAssertion {
  credentialId: string;
  authenticatorData: string;
  clientDataJson: string;
  signature: string;
}

// Real assertion ceremony — signs the issued session challenge.
async function signWithPasskey(
  challengeValue: string,
  credentialId: string,
): Promise<RealAssertion> {
  if (!challengeValue) {
    throw new Error("No challenge — issue a session challenge (step above) first.");
  }
  // PR #28427: Turnkey's WebAuthn challenge is the UTF-8 bytes of the
  // sha256-hex challenge string returned by /challenge — NOT base64url-decoded.
  const challenge = new TextEncoder().encode(challengeValue);
  const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
    ? [{ type: "public-key", id: b64UrlToBytes(credentialId) as BufferSource }]
    : [];
  const credential = (await navigator.credentials.get({
    publicKey: {
      rpId: passkeyRpId(),
      challenge,
      allowCredentials,
      userVerification: "preferred",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey assertion returned no credential");
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    authenticatorData: bytesToB64Url(new Uint8Array(response.authenticatorData)),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    signature: bytesToB64Url(new Uint8Array(response.signature)),
  };
}

// ----- PASSKEY -----

bindClick(
  "btn-passkey-create",
  "passkey-create-status",
  "PASSKEY Create",
  "Creating PASSKEY wallet...",
  async () => {
    const body = {
      type: "PASSKEY",
      accountId: requireAccountId(),
      nickname: el<HTMLInputElement>("passkey-create-nickname").value.trim(),
      challenge: el<HTMLInputElement>("passkey-create-challenge").value.trim(),
      attestation: {
        credentialId: el<HTMLInputElement>("passkey-create-cred-id-raw").value.trim(),
        clientDataJson: el<HTMLInputElement>("passkey-create-client-data-json").value.trim(),
        attestationObject: el<HTMLInputElement>("passkey-create-attestation-object").value.trim(),
      },
    };
    const { data } = await apiPost("/auth/credentials", body);
    addLog("PASSKEY Create", data);
    const d = data as Record<string, unknown>;
    if (d.id) setCtxCredential(d.id as string);
    return JSON.stringify(data, null, 2);
  },
);

// Drive a real WebAuthn registration (Touch ID) and fill the attestation
// fields above — used by both the "Create" and "Add additional" flows.
bindClick(
  "btn-passkey-webauthn-create",
  "passkey-webauthn-create-status",
  "Passkey Register",
  "Waiting for authenticator (Touch ID)...",
  async () => {
    const nickname = el<HTMLInputElement>("passkey-create-nickname").value.trim();
    const att = await createRealPasskey(nickname);
    el<HTMLInputElement>("passkey-create-challenge").value = att.challenge;
    el<HTMLInputElement>("passkey-create-cred-id-raw").value = att.credentialId;
    el<HTMLInputElement>("passkey-create-client-data-json").value = att.clientDataJson;
    el<HTMLInputElement>("passkey-create-attestation-object").value =
      att.attestationObject;
    addLog("Passkey Registered (real)", att);
    return "Real passkey created — attestation fields filled. Now run Create or Add.";
  },
);

wireGenKeyButton("btn-passkey-challenge-genkey", "passkey-challenge-pubkey");
const passkeyVerifyRequestId = el<HTMLInputElement>("passkey-verify-request-id");
// Captured from the session-challenge response so the real assertion ceremony
// can sign the exact sha256-hex challenge Turnkey expects.
let passkeySessionChallenge = "";
bindClick(
  "btn-passkey-challenge",
  "passkey-challenge-status",
  "PASSKEY Challenge",
  "Issuing session challenge...",
  async () => {
    const credId = requireCredentialId();
    const pubkey = el<HTMLInputElement>("passkey-challenge-pubkey").value.trim();
    if (!pubkey) throw new Error("Client public key is required — generate one first.");
    const { data } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
      { clientPublicKey: pubkey },
    );
    addLog("PASSKEY Challenge", data);
    const d = data as Record<string, unknown>;
    if (d.requestId) passkeyVerifyRequestId.value = d.requestId as string;
    if (typeof d.challenge === "string") passkeySessionChallenge = d.challenge;
    return JSON.stringify(data, null, 2);
  },
);

bindClick(
  "btn-passkey-verify",
  "passkey-verify-status",
  "PASSKEY Verify",
  "Verifying assertion...",
  async () => {
    const credId = requireCredentialId();
    const requestId = passkeyVerifyRequestId.value.trim();
    const body = {
      type: "PASSKEY",
      clientPublicKey: el<HTMLInputElement>("passkey-challenge-pubkey").value.trim(),
      assertion: {
        credentialId: el<HTMLInputElement>("passkey-create-cred-id-raw").value.trim(),
        clientDataJson: el<HTMLInputElement>("passkey-verify-client-data-json").value.trim(),
        authenticatorData: el<HTMLInputElement>("passkey-verify-auth-data").value.trim(),
        signature: el<HTMLInputElement>("passkey-verify-signature").value.trim(),
      },
    };
    const headers: Record<string, string> = {};
    if (requestId) headers["Request-Id"] = requestId;
    const { data } = await apiPost(
      `/auth/credentials/${encodeURIComponent(credId)}/verify`,
      body,
      headers,
    );
    addLog("PASSKEY Verify", data);
    const d = data as Record<string, unknown>;
    if (d.id) setCtxSession(d.id as string);
    rememberEncryptedSessionSigningKey(d.encryptedSessionSigningKey);
    return JSON.stringify(data, null, 2);
  },
);

// Drive a real WebAuthn assertion (Touch ID) against the issued challenge and
// fill the assertion fields above for Verify.
bindClick(
  "btn-passkey-webauthn-get",
  "passkey-webauthn-get-status",
  "Passkey Sign",
  "Waiting for authenticator (Touch ID)...",
  async () => {
    const credId = el<HTMLInputElement>("passkey-create-cred-id-raw").value.trim();
    const assertion = await signWithPasskey(passkeySessionChallenge, credId);
    el<HTMLInputElement>("passkey-create-cred-id-raw").value = assertion.credentialId;
    el<HTMLInputElement>("passkey-verify-client-data-json").value =
      assertion.clientDataJson;
    el<HTMLInputElement>("passkey-verify-auth-data").value =
      assertion.authenticatorData;
    el<HTMLInputElement>("passkey-verify-signature").value = assertion.signature;
    addLog("Passkey Signed (real)", assertion);
    return "Real assertion produced — verify fields filled. Now click Verify.";
  },
);

const passkeyAddRequestId = el<HTMLInputElement>("passkey-add-request-id");
// Captured from the add-issue 202 so the retry can stamp the exact payload.
let passkeyAddPayloadToSign = "";
function buildPasskeyAddBody(): Record<string, unknown> {
  return {
    type: "PASSKEY",
    accountId: requireAccountId(),
    nickname: el<HTMLInputElement>("passkey-add-nickname").value.trim(),
    challenge: el<HTMLInputElement>("passkey-create-challenge").value.trim(),
    attestation: {
      credentialId: el<HTMLInputElement>("passkey-create-cred-id-raw").value.trim(),
      clientDataJson: el<HTMLInputElement>("passkey-create-client-data-json").value.trim(),
      attestationObject: el<HTMLInputElement>("passkey-create-attestation-object").value.trim(),
    },
  };
}
bindClick(
  "btn-passkey-add-issue",
  "passkey-add-issue-status",
  "PASSKEY Add (issue)",
  "Issuing add challenge...",
  async () => {
    const { data } = await apiPost("/auth/credentials", buildPasskeyAddBody());
    addLog("PASSKEY Add (issue)", data);
    const d = data as Record<string, unknown>;
    if (d.requestId) passkeyAddRequestId.value = d.requestId as string;
    if (typeof d.payloadToSign === "string") passkeyAddPayloadToSign = d.payloadToSign;
    return JSON.stringify(data, null, 2);
  },
);
bindClick(
  "btn-passkey-add-retry",
  "passkey-add-retry-status",
  "PASSKEY Add (retry)",
  "Forwarding signed retry...",
  async () => {
    const requestId = passkeyAddRequestId.value.trim();
    if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
    // Sandbox accepts the magic value, but real Turnkey requires the
    // CREATE_AUTHENTICATORS payload to be stamped by an authorized credential —
    // the active session's signing key. Establish a session (e.g. OTP login or
    // passkey verify) first so the session signing key is available.
    let signature = SANDBOX_SIG;
    if (getMode() === "production") {
      if (!passkeyAddPayloadToSign) {
        throw new Error("Missing payloadToSign — run step 1 first.");
      }
      signature = await turnkeyStamp(passkeyAddPayloadToSign);
    }
    const { data } = await apiPost(
      "/auth/credentials",
      buildPasskeyAddBody(),
      { "Grid-Wallet-Signature": signature, "Request-Id": requestId },
    );
    addLog("PASSKEY Add (retry)", data);
    return JSON.stringify(data, null, 2);
  },
);

// ==========================================================
// Shared signed-retry wiring per tab: delete credential / session / export
// Endpoints identical for all tabs — inputs come from the shared ctx, the
// per-tab buttons just visually group each flow under the relevant tab.
// ==========================================================

function wireDeleteCredentialButtons(type: CredType): void {
  const reqInput = el<HTMLInputElement>(`${type}-del-cred-request-id`);
  bindClick(
    `btn-${type}-del-cred-issue`,
    `${type}-del-cred-issue-status`,
    "Delete Credential (issue)",
    "Issuing delete challenge...",
    async () => {
      const credId = requireCredentialId();
      const { data } = await apiDelete(
        `/auth/credentials/${encodeURIComponent(credId)}`,
      );
      addLog("Delete Credential (issue)", data);
      const d = data as Record<string, unknown>;
      if (d.requestId) reqInput.value = d.requestId as string;
      return JSON.stringify(data, null, 2);
    },
  );
  bindClick(
    `btn-${type}-del-cred-retry`,
    `${type}-del-cred-retry-status`,
    "Delete Credential (retry)",
    "Forwarding signed retry...",
    async () => {
      const credId = requireCredentialId();
      const requestId = reqInput.value.trim();
      if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiDelete(
        `/auth/credentials/${encodeURIComponent(credId)}`,
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Delete Credential (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );
}

function wireDeleteSessionButtons(type: CredType): void {
  const reqInput = el<HTMLInputElement>(`${type}-del-session-request-id`);
  bindClick(
    `btn-${type}-del-session-issue`,
    `${type}-del-session-issue-status`,
    "Delete Session (issue)",
    "Issuing delete challenge...",
    async () => {
      const sid = requireSessionId();
      const { data } = await apiDelete(
        `/auth/sessions/${encodeURIComponent(sid)}`,
      );
      addLog("Delete Session (issue)", data);
      const d = data as Record<string, unknown>;
      if (d.requestId) reqInput.value = d.requestId as string;
      return JSON.stringify(data, null, 2);
    },
  );
  bindClick(
    `btn-${type}-del-session-retry`,
    `${type}-del-session-retry-status`,
    "Delete Session (retry)",
    "Forwarding signed retry...",
    async () => {
      const sid = requireSessionId();
      const requestId = reqInput.value.trim();
      if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiDelete(
        `/auth/sessions/${encodeURIComponent(sid)}`,
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Delete Session (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );
}

function wireExportButtons(type: CredType): void {
  const reqInput = el<HTMLInputElement>(`${type}-export-request-id`);
  bindClick(
    `btn-${type}-export-issue`,
    `${type}-export-issue-status`,
    "Wallet Export (issue)",
    "Issuing export challenge...",
    async () => {
      const accountId = requireAccountId();
      const { data } = await apiPost(
        `/internal-accounts/${encodeURIComponent(accountId)}/export`,
        {},
      );
      addLog("Wallet Export (issue)", data);
      const d = data as Record<string, unknown>;
      if (d.requestId) reqInput.value = d.requestId as string;
      return JSON.stringify(data, null, 2);
    },
  );
  bindClick(
    `btn-${type}-export-retry`,
    `${type}-export-retry-status`,
    "Wallet Export (retry)",
    "Forwarding signed retry...",
    async () => {
      const accountId = requireAccountId();
      const requestId = reqInput.value.trim();
      if (!requestId) throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiPost(
        `/internal-accounts/${encodeURIComponent(accountId)}/export`,
        {},
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Wallet Export (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );
}

for (const type of ["email_otp", "oauth", "passkey"] as const) {
  wireDeleteCredentialButtons(type);
  wireDeleteSessionButtons(type);
  wireExportButtons(type);
}

// ==========================================================
// List credentials / sessions
// ==========================================================

bindClick(
  "btn-list-credentials",
  "list-status",
  "List Credentials",
  "Listing...",
  async () => {
    const accountId = requireAccountId();
    const data = await apiGet(
      `/auth/credentials?accountId=${encodeURIComponent(accountId)}`,
    );
    addLog("List Credentials", data);
    return JSON.stringify(data, null, 2);
  },
);

bindClick(
  "btn-list-sessions",
  "list-status",
  "List Sessions",
  "Listing...",
  async () => {
    const accountId = requireAccountId();
    const data = await apiGet(
      `/auth/sessions?accountId=${encodeURIComponent(accountId)}`,
    );
    addLog("List Sessions", data);
    return JSON.stringify(data, null, 2);
  },
);

// ==========================================================
// External account + Quote + Execute
// ==========================================================

const extAccountType = el<HTMLSelectElement>("ext-account-type");
const extSparkFields = el<HTMLDivElement>("ext-spark-fields");
const extBankFields = el<HTMLDivElement>("ext-bank-fields");
const quoteDestinationAccountId = el<HTMLInputElement>("quote-destination-account-id");

extAccountType.addEventListener("change", () => {
  const isSpark = extAccountType.value === "SPARK_WALLET";
  extSparkFields.style.display = isSpark ? "" : "none";
  extBankFields.style.display = isSpark ? "none" : "";
});

bindClick(
  "btn-create-external-account",
  "ext-account-status",
  "Create External Account",
  "Creating external account...",
  async () => {
    let body: Record<string, unknown>;
    if (extAccountType.value === "SPARK_WALLET") {
      const address = el<HTMLInputElement>("ext-spark-address").value.trim();
      if (!address) throw new Error("Spark address is required.");
      body = {
        currency: "BTC",
        accountInfo: { accountType: "SPARK_WALLET", address },
      };
    } else {
      const accountNumber = el<HTMLInputElement>("ext-bank-account-number").value.trim();
      const routingNumber = el<HTMLInputElement>("ext-bank-routing-number").value.trim();
      const fullName =
        el<HTMLInputElement>("ext-bank-beneficiary-name").value.trim() || "Sandbox Test User";
      if (!accountNumber || !routingNumber)
        throw new Error("Account number and routing number are required.");
      body = {
        currency: "USD",
        accountInfo: {
          accountType: "USD_ACCOUNT",
          countries: ["US"],
          paymentRails: ["ACH", "WIRE", "RTP", "FEDNOW"],
          accountNumber,
          routingNumber,
          beneficiary: {
            beneficiaryType: "INDIVIDUAL",
            fullName,
            birthDate: "1990-01-15",
            nationality: "US",
            address: {
              line1: "100 Test St",
              city: "SF",
              postalCode: "94102",
              country: "US",
            },
          },
        },
      };
    }
    const { data } = await apiPost("/platform/external-accounts", body);
    addLog("Create External Account", data);
    const d = data as Record<string, unknown>;
    if (d.id) quoteDestinationAccountId.value = d.id as string;
    return JSON.stringify(data, null, 2);
  },
);

const executeQuoteId = el<HTMLInputElement>("execute-quote-id");

bindClick(
  "btn-create-quote",
  "quote-status",
  "Create Quote",
  "Creating quote...",
  async () => {
    const sourceAccountId = requireAccountId();
    const destinationAccountId = quoteDestinationAccountId.value.trim();
    const lockedAmount = Number(el<HTMLInputElement>("quote-locked-amount").value);
    if (!destinationAccountId || !lockedAmount)
      throw new Error("Destination external account and amount are required.");
    const { data } = await apiPost("/quotes", {
      source: { sourceType: "ACCOUNT", accountId: sourceAccountId },
      destination: { destinationType: "ACCOUNT", accountId: destinationAccountId },
      lockedCurrencySide: el<HTMLSelectElement>("quote-locked-side").value,
      lockedCurrencyAmount: lockedAmount,
    });
    addLog("Create Quote", data);
    const d = data as Record<string, unknown>;
    if (d.id) executeQuoteId.value = d.id as string;
    // Extract `payloadToSign` from the EMBEDDED_WALLET payment instruction
    // (second entry in the example response — find by accountType match).
    const instructions = (d.paymentInstructions ?? []) as Array<
      Record<string, unknown>
    >;
    for (const inst of instructions) {
      const info = inst.accountOrWalletInfo as Record<string, unknown> | undefined;
      if (info && info.accountType === "EMBEDDED_WALLET" && info.payloadToSign) {
        executePayloadToSign.value = info.payloadToSign as string;
        break;
      }
    }
    // In sandbox mode, pre-fill the magic signature so the user can hit
    // Execute immediately. In production mode, leave blank — the Sign
    // payload button decrypts the session bundle and stamps it.
    if (getMode() === "sandbox") {
      executeSignature.value = SANDBOX_SIG;
    } else {
      executeSignature.value = "";
    }
    return JSON.stringify(data, null, 2);
  },
);

const executePayloadToSign = el<HTMLTextAreaElement>("execute-payload-to-sign");
const executeSignature = el<HTMLInputElement>("execute-signature");

bindClick(
  "btn-sign-payload",
  "execute-status",
  "Sign Payload",
  "Signing...",
  async () => {
    if (getMode() === "sandbox") {
      executeSignature.value = SANDBOX_SIG;
      return `Mode: sandbox — filled magic signature.`;
    }
    const payload = executePayloadToSign.value.trim();
    if (!payload)
      throw new Error(
        "payloadToSign is empty — run Create Quote first or paste it manually.",
      );
    const stamp = await turnkeyStamp(payload);
    executeSignature.value = stamp;
    return `Stamped (${stamp.length} chars).`;
  },
);

bindClick(
  "btn-execute-quote",
  "execute-status",
  "Execute Quote",
  "Executing quote...",
  async () => {
    const quoteId = executeQuoteId.value.trim();
    const signature = executeSignature.value.trim();
    if (!quoteId || !signature)
      throw new Error("Quote ID and Grid-Wallet-Signature are required.");
    const { data } = await apiPost(
      `/quotes/${encodeURIComponent(quoteId)}/execute`,
      {},
      { "Grid-Wallet-Signature": signature },
    );
    addLog("Execute Quote", data);
    return JSON.stringify(data, null, 2);
  },
);

console.log("Grid Global Accounts example app loaded.");
