// OAUTH lifecycle: guided login, create, verify (→ session), add.
//
// DOM-free operation functions: the React layer supplies the OIDC token + client
// public key and renders the returned data; this module only talks to Grid and
// emits log events through the injected `Reporter`.

import { SANDBOX_SIG } from "../config";
import { apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { generateClientKeyPair, turnkeyStamp } from "../turnkey";
import { setSessionKeysFromVerify } from "../session";
import { loginClientPublicKey } from "../login-key-encoding";
import { setCtxCredential, setCtxSession } from "./context";

// Run /verify with the OIDC token + client public key, adopting whichever
// session signing key the response carries. Shared by the guided login and the
// manual verify path.
export async function runOauthVerify(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  oidc: string,
  pubkey: string,
): Promise<unknown> {
  if (!oidc.trim()) throw new Error("OIDC token is required.");
  if (!pubkey.trim()) throw new Error("Client public key is required.");
  const clientPublicKey = pubkey.trim();
  const { data } = await apiPost(
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/verify`,
    { type: "OAUTH", oidcToken: oidc.trim(), clientPublicKey },
  );
  reporter.log({ level: "response", label: "OAUTH Verify", detail: data });
  const d = data as Record<string, unknown>;
  if (d.id) setCtxSession(d.id as string);
  // Legacy ACTIVITY_TYPE_OAUTH returns the bundle; OAUTH_LOGIN (the
  // login-family knob ON) returns a session JWT only and the client keypair
  // behind `clientPublicKey` is the session key. Pass the key exactly as sent
  // so the cached session key is the one Turnkey registered.
  setSessionKeysFromVerify(d.encryptedSessionSigningKey, clientPublicKey);
  return data;
}

export interface OauthLoginResult {
  data: unknown;
  /** The freshly generated client public key that was sent to /verify. */
  clientPublicKey: string;
}

// Guided log in: gen client key → /verify with OIDC token + clientPublicKey →
// adopt the session signing key.
export async function loginOauth(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  oidc: string,
): Promise<OauthLoginResult> {
  if (!oidc.trim()) throw new Error("OIDC token is required.");
  const kp = generateClientKeyPair();
  // Encoding of the key Grid registers as the OAUTH_LOGIN session API key, per
  // the legacy-vs-modern toggle. Modern (compressed) is the default: Turnkey
  // stores/matches session API keys compressed, so the uncompressed legacy key
  // takes the server HPKE-bundle path instead.
  const clientPublicKey = loginClientPublicKey(kp);
  const data = await runOauthVerify(
    reporter,
    auth,
    credId,
    oidc,
    clientPublicKey,
  );
  return { data, clientPublicKey };
}

// ----- Sign-in entry point (create-vs-authenticate) -----
//
// Mirror of EMAIL_OTP's signIn: only create an OAUTH credential when the wallet
// doesn't already have one (a second create would 400 with
// OAUTH_CREDENTIAL_ALREADY_EXISTS). When `existingCredId` is provided we verify
// directly against it; otherwise we run the original create + verify ceremony.
export async function signInOauth(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  oidc: string,
  existingCredId: string | null,
): Promise<unknown> {
  let credId = existingCredId;
  if (!credId) {
    const cred = await createOauthCredential(reporter, auth, accountId, oidc);
    credId = (cred as { id?: string }).id ?? null;
    if (!credId) throw new Error("Create credential returned no id.");
  }
  const { data } = await loginOauth(reporter, auth, credId, oidc);
  return data;
}

export async function createOauthCredential(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  oidc: string,
): Promise<unknown> {
  if (!oidc.trim()) throw new Error("OIDC token is required.");
  const { data } = await apiPost(auth, "/auth/credentials", {
    type: "OAUTH",
    accountId,
    oidcToken: oidc.trim(),
  });
  reporter.log({ level: "response", label: "OAUTH Create", detail: data });
  const d = data as Record<string, unknown>;
  if (d.id) setCtxCredential(d.id as string);
  return data;
}

export async function addOauthIssue(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  oidc: string,
): Promise<{
  data: unknown;
  requestId: string | undefined;
  payloadToSign: string | undefined;
}> {
  if (!oidc.trim()) throw new Error("OIDC token is required.");
  const { data } = await apiPost(auth, "/auth/credentials", {
    type: "OAUTH",
    accountId,
    oidcToken: oidc.trim(),
  });
  reporter.log({ level: "response", label: "OAUTH Add (issue)", detail: data });
  const d = data as Record<string, unknown>;
  const requestId = typeof d.requestId === "string" ? d.requestId : undefined;
  const payloadToSign =
    typeof d.payloadToSign === "string" ? d.payloadToSign : undefined;
  return { data, requestId, payloadToSign };
}

export async function addOauthRetry(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  oidc: string,
  requestId: string,
  payloadToSign: string | undefined,
): Promise<unknown> {
  if (!requestId.trim())
    throw new Error("Request-Id is required — run the issue step first.");
  // Real Turnkey requires the CREATE_OAUTH_PROVIDERS payload to be stamped by
  // the active session's signing key; sandbox accepts the magic value.
  let signature = SANDBOX_SIG;
  if (auth.mode === "production") {
    if (!payloadToSign)
      throw new Error("Missing payloadToSign — run the issue step first.");
    signature = await turnkeyStamp(payloadToSign);
  }
  const { data } = await apiPost(
    auth,
    "/auth/credentials",
    { type: "OAUTH", accountId, oidcToken: oidc.trim() },
    { "Grid-Wallet-Signature": signature, "Request-Id": requestId.trim() },
  );
  reporter.log({ level: "response", label: "OAUTH Add (retry)", detail: data });
  return data;
}
