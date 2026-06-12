// EMAIL_OTP lifecycle: create, secure-OTP challenge/verify, add.

import { generateP256KeyPair } from "@turnkey/crypto";

import { SANDBOX_SIG } from "../config";
import { apiPost } from "../api-client";
import { buildWalletSignature, sealOtpBundle } from "../turnkey";
import { setSessionKeysFromTek } from "../session";
import { addLog, bindClick, el } from "../ui";
import {
  requireAccountId,
  requireCredentialId,
  setCtxCredential,
  setCtxSession,
} from "./context";

// Secure OTP — works against real Turnkey, which emails a real OTP (sandbox
// uses the fixed 000000). /challenge issues the INIT_OTP and returns the
// enclave's target bundle; Verify HPKE-seals the entered code under it, runs
// /verify first leg (202 + payloadToSign), signs the token with the TEK, and
// runs /verify retry (200 session). The code never leaves the client in
// plaintext; the TEK private key stays client-side (no encryptedSessionSigningKey
// is returned).

// Request a challenge for `credId` and return the enclave target bundle.
async function requestV3Challenge(credId: string): Promise<string> {
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
  return targetBundle;
}

// Run the two verify legs against `targetBundle` with the entered `otp`, caching
// the TEK as the session signing key on success. Returns a summary string.
async function runV3Verify(
  credId: string,
  targetBundle: string,
  otp: string,
): Promise<string> {
  // Generate a TEK and HPKE-seal the entered OTP under the challenge bundle.
  const tek = generateP256KeyPair();
  const encryptedOtpBundle = sealOtpBundle(targetBundle, tek.publicKey, otp);

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
  // The TEK is now the session's API key (OTP_LOGIN registered it). Cache it as
  // the active session signing key so later signed retries (add passkey, quote
  // execute, etc.) can stamp with this session via turnkeyStamp().
  // MIGRATION (P6): this OTP-TEK caching is the model passkey/oauth login
  // converge on once the login-family knob is ON — see oauth.ts/passkey.ts.
  if (leg2.status === 200) setSessionKeysFromTek(tek);
  return JSON.stringify({ leg1: leg1.data, session: leg2.data }, null, 2);
}

export function wireEmailOtpFlows(): void {
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

  // ----- Guided: Log in (Email OTP) -----
  //
  // One click owns the whole chain: /challenge → inline code prompt →
  // verify legs → cache TEK as session. Folds the manual challenge + verify
  // buttons below into a single opinionated flow.
  bindClick(
    "btn-email_otp-login",
    "email_otp-login-status",
    "Email OTP Login",
    "Requesting OTP...",
    async () => {
      const credId = requireCredentialId();
      const targetBundle = await requestV3Challenge(credId);
      const codeInput = el<HTMLInputElement>("email_otp-v3-code").value.trim();
      // In sandbox the code field is pre-seeded (000000); in production the
      // user reads it from the email, so prompt for it inline if blank.
      const otp =
        codeInput ||
        (
          window.prompt("Enter the OTP code emailed to the customer:") ?? ""
        ).trim();
      if (!otp) throw new Error("OTP code is required.");
      return runV3Verify(credId, targetBundle, otp);
    },
  );

  // ----- Manual (advanced): challenge + verify as separate steps -----

  // Target bundle from the most recent manual V3 challenge + the credential it
  // was issued for, so Verify catches a stale/mismatched bundle.
  let v3TargetBundle: string | null = null;
  let v3TargetBundleCredId: string | null = null;

  bindClick(
    "btn-email_otp-v3-challenge",
    "email_otp-v3-challenge-status",
    "EMAIL_OTP Challenge (V3)",
    "Requesting OTP...",
    async () => {
      const credId = requireCredentialId();
      v3TargetBundle = await requestV3Challenge(credId);
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
      const summary = await runV3Verify(credId, v3TargetBundle, otp);
      // One bundle per challenge — force a fresh Challenge for the next run.
      v3TargetBundle = null;
      v3TargetBundleCredId = null;
      return summary;
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
      if (!requestId)
        throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiPost(
        "/auth/credentials",
        { type: "EMAIL_OTP", accountId: requireAccountId() },
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("EMAIL_OTP Add (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );
}
