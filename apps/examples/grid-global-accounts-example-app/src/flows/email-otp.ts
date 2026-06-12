// EMAIL_OTP lifecycle: create, secure-OTP challenge/verify, rechallenge, add.
//
// DOM-free operation functions. The secure-OTP code never leaves the client in
// plaintext; the TEK private key stays client-side (no encryptedSessionSigningKey
// is returned). Each function takes the platform `auth`, the values it needs,
// and a `Reporter`, and returns its result.

import { generateP256KeyPair } from "@turnkey/crypto";

import { SANDBOX_SIG } from "../config";
import { apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { buildWalletSignature, sealOtpBundle } from "../turnkey";
import { setSessionKeysFromTek } from "../session";
import { setCtxCredential, setCtxSession } from "./context";

// ----- Create credential -----

export async function createEmailOtpCredential(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
): Promise<unknown> {
  const { data } = await apiPost(auth, "/auth/credentials", {
    type: "EMAIL_OTP",
    accountId,
  });
  reporter.log({ level: "response", label: "EMAIL_OTP Create", detail: data });
  const d = data as Record<string, unknown>;
  if (d.id) setCtxCredential(d.id as string);
  return data;
}

// ----- Secure OTP -----
//
// /challenge issues the INIT_OTP and returns the enclave's target bundle; verify
// HPKE-seals the entered code under it, runs /verify first leg (202 +
// payloadToSign), signs the token with the TEK, then runs /verify retry (200
// session).

// Request a challenge for `credId` and return the enclave target bundle.
export async function requestV3Challenge(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
): Promise<string> {
  const { data: challengeData } = await apiPost(
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
    {},
  );
  reporter.log({
    level: "response",
    label: "V3 Challenge",
    detail: challengeData,
  });
  const targetBundle = (challengeData as Record<string, unknown>)
    .otpEncryptionTargetBundle as string | undefined;
  if (!targetBundle)
    throw new Error(
      "Challenge response missing otpEncryptionTargetBundle — is the local " +
        "backend running the secure-OTP branch?",
    );
  return targetBundle;
}

export interface V3VerifyResult {
  leg1: unknown;
  session: unknown;
}

// Run the two verify legs against `targetBundle` with the entered `otp`, caching
// the TEK as the session signing key on success.
export async function runV3Verify(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  targetBundle: string,
  otp: string,
): Promise<V3VerifyResult> {
  // Generate a TEK and HPKE-seal the entered OTP under the challenge bundle.
  const tek = generateP256KeyPair();
  const encryptedOtpBundle = sealOtpBundle(targetBundle, tek.publicKey, otp);

  // First leg → expect 202 with payloadToSign (verificationToken) + requestId.
  const leg1 = await apiPost(
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/verify`,
    { type: "EMAIL_OTP", encryptedOtpBundle },
  );
  const l1 = (leg1.data ?? {}) as Record<string, unknown>;
  reporter.log({
    level: "response",
    label: "V3 Verify leg 1 (expect 202)",
    detail: { status: leg1.status, ...l1 },
  });
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
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/verify`,
    { type: "EMAIL_OTP", encryptedOtpBundle },
    { "Grid-Wallet-Signature": signature, "Request-Id": requestId },
  );
  const session = (leg2.data ?? {}) as Record<string, unknown>;
  reporter.log({
    level: "response",
    label: "V3 Verify leg 2 (expect 200 session)",
    detail: { status: leg2.status, ...session },
  });
  if (session.id) setCtxSession(session.id as string);
  // The TEK is now the session's API key (OTP_LOGIN registered it). Cache it as
  // the active session signing key so later signed retries (add passkey, quote
  // execute, etc.) can stamp with this session via turnkeyStamp().
  // MIGRATION (P6): this OTP-TEK caching is the model passkey/oauth login
  // converge on once the login-family knob is ON — see oauth.ts/passkey.ts.
  if (leg2.status === 200) setSessionKeysFromTek(tek);
  return { leg1: leg1.data, session: leg2.data };
}

// Guided log in: /challenge → verify legs → cache TEK as session.
export async function loginEmailOtp(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  otp: string,
): Promise<V3VerifyResult> {
  const targetBundle = await requestV3Challenge(reporter, auth, credId);
  if (!otp.trim()) throw new Error("OTP code is required.");
  return runV3Verify(reporter, auth, credId, targetBundle, otp.trim());
}

// ----- Sign-in entry point (create-vs-authenticate) -----
//
// The fix for EMAIL_OTP_CREDENTIAL_ALREADY_EXISTS: only create a credential when
// the caller doesn't already have one. If `existingCredId` is provided, we
// authenticate against it directly (challenge → verify) and never POST
// /auth/credentials; otherwise we run the original create + verify ceremony.
//
// The create/login functions are injected so the decision is unit-testable at
// the flow boundary without exercising real Turnkey.
export interface EmailOtpSignInDeps {
  create: typeof createEmailOtpCredential;
  login: typeof loginEmailOtp;
}

const defaultEmailOtpSignInDeps: EmailOtpSignInDeps = {
  create: createEmailOtpCredential,
  login: loginEmailOtp,
};

export async function signInEmailOtp(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  otp: string,
  existingCredId: string | null,
  deps: EmailOtpSignInDeps = defaultEmailOtpSignInDeps,
): Promise<unknown> {
  let credId = existingCredId;
  if (!credId) {
    // No existing EMAIL_OTP credential — run the create leg first.
    const cred = await deps.create(reporter, auth, accountId);
    credId = (cred as { id?: string }).id ?? null;
    if (!credId) throw new Error("Create credential returned no id.");
  }
  const result = await deps.login(reporter, auth, credId, otp);
  return result.session;
}

// ----- Add an additional EMAIL_OTP credential (issue → signed retry) -----

export async function addEmailOtpIssue(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
): Promise<{ data: unknown; requestId: string | undefined }> {
  const { data } = await apiPost(auth, "/auth/credentials", {
    type: "EMAIL_OTP",
    accountId,
  });
  reporter.log({
    level: "response",
    label: "EMAIL_OTP Add (issue)",
    detail: data,
  });
  const d = data as Record<string, unknown>;
  const requestId = typeof d.requestId === "string" ? d.requestId : undefined;
  return { data, requestId };
}

export async function addEmailOtpRetry(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  requestId: string,
): Promise<unknown> {
  if (!requestId.trim())
    throw new Error("Request-Id is required — run the issue step first.");
  const { data } = await apiPost(
    auth,
    "/auth/credentials",
    { type: "EMAIL_OTP", accountId },
    { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId.trim() },
  );
  reporter.log({
    level: "response",
    label: "EMAIL_OTP Add (retry)",
    detail: data,
  });
  return data;
}
