// PASSKEY lifecycle: create (real registration), challenge, verify (assertion),
// add (signed retry, session-stamped in production).

import { SANDBOX_SIG } from "../config";
import { apiPost, getMode } from "../api-client";
import { generateClientKeyPair, turnkeyStamp } from "../turnkey";
import {
  hasSessionSigningKey,
  onSessionChange,
  rememberEncryptedSessionSigningKey,
} from "../session";
import { createRealPasskey, signWithPasskey } from "../webauthn";
import {
  addLog,
  bindClick,
  el,
  maybeEl,
  wireGatedButton,
  wireGenKeyButton,
} from "../ui";
import {
  requireAccountId,
  requireCredentialId,
  setCtxCredential,
  setCtxSession,
} from "./context";

// Run /verify with the assertion currently in the DOM fields (populated by the
// real ceremony in production or the seeded magic fields in sandbox), caching
// the session bundle on success. Shared by guided login + the manual button.
async function runPasskeyVerify(
  credId: string,
  requestId: string | undefined,
): Promise<string> {
  const body = {
    type: "PASSKEY",
    clientPublicKey: el<HTMLInputElement>(
      "passkey-challenge-pubkey",
    ).value.trim(),
    assertion: {
      credentialId: el<HTMLInputElement>(
        "passkey-create-cred-id-raw",
      ).value.trim(),
      clientDataJson: el<HTMLInputElement>(
        "passkey-verify-client-data-json",
      ).value.trim(),
      authenticatorData: el<HTMLInputElement>(
        "passkey-verify-auth-data",
      ).value.trim(),
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
  // MIGRATION (P6): PASSKEY login moves to STAMP_LOGIN; the knob-ON response
  // drops `encryptedSessionSigningKey`, so this becomes the OTP-style
  // `setSessionKeysFromTek(clientKeyPair)` path. The shape-detection in
  // `rememberEncryptedSessionSigningKey` already no-ops when the field is
  // absent — flip this one call once the P2 wire shape settles.
  rememberEncryptedSessionSigningKey(d.encryptedSessionSigningKey);
  return JSON.stringify(data, null, 2);
}

export function wirePasskeyFlows(): void {
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
        challenge: el<HTMLInputElement>(
          "passkey-create-challenge",
        ).value.trim(),
        attestation: {
          credentialId: el<HTMLInputElement>(
            "passkey-create-cred-id-raw",
          ).value.trim(),
          clientDataJson: el<HTMLInputElement>(
            "passkey-create-client-data-json",
          ).value.trim(),
          attestationObject: el<HTMLInputElement>(
            "passkey-create-attestation-object",
          ).value.trim(),
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
      const nickname = el<HTMLInputElement>(
        "passkey-create-nickname",
      ).value.trim();
      const att = await createRealPasskey(nickname);
      el<HTMLInputElement>("passkey-create-challenge").value = att.challenge;
      el<HTMLInputElement>("passkey-create-cred-id-raw").value =
        att.credentialId;
      el<HTMLInputElement>("passkey-create-client-data-json").value =
        att.clientDataJson;
      el<HTMLInputElement>("passkey-create-attestation-object").value =
        att.attestationObject;
      addLog("Passkey Registered (real)", att);
      return "Real passkey created — attestation fields filled. Now run Create or Add.";
    },
  );

  wireGenKeyButton("btn-passkey-challenge-genkey", "passkey-challenge-pubkey");
  const passkeyVerifyRequestId = el<HTMLInputElement>(
    "passkey-verify-request-id",
  );
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
      const pubkey = el<HTMLInputElement>(
        "passkey-challenge-pubkey",
      ).value.trim();
      if (!pubkey)
        throw new Error("Client public key is required — generate one first.");
      const { data } = await apiPost(
        `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
        { clientPublicKey: pubkey },
      );
      addLog("PASSKEY Challenge", data);
      const d = data as Record<string, unknown>;
      if (d.requestId) passkeyVerifyRequestId.value = d.requestId as string;
      if (typeof d.challenge === "string")
        passkeySessionChallenge = d.challenge;
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
      const requestId = passkeyVerifyRequestId.value.trim() || undefined;
      return runPasskeyVerify(credId, requestId);
    },
  );

  // ----- Guided: Log in (Passkey) -----
  //
  // One click owns the chain: gen client key → /challenge → assertion (a real
  // Touch ID ceremony in production, the seeded magic fields in sandbox) →
  // /verify → remember session bundle. Folds the manual genkey + challenge +
  // sign + verify buttons below.
  bindClick(
    "btn-passkey-login",
    "passkey-login-status",
    "Passkey Login",
    "Logging in with passkey...",
    async () => {
      const credId = requireCredentialId();
      const kp = generateClientKeyPair();
      el<HTMLInputElement>("passkey-challenge-pubkey").value =
        kp.publicKeyUncompressed;

      // Issue the session challenge bound to the fresh client key.
      const { data: challengeData } = await apiPost(
        `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
        { clientPublicKey: kp.publicKeyUncompressed },
      );
      addLog("PASSKEY Challenge", challengeData);
      const cd = challengeData as Record<string, unknown>;
      const requestId =
        typeof cd.requestId === "string" ? cd.requestId : undefined;
      const challenge = typeof cd.challenge === "string" ? cd.challenge : "";
      if (requestId) passkeyVerifyRequestId.value = requestId;
      passkeySessionChallenge = challenge;

      // Produce the assertion. Production runs a real Touch ID ceremony and
      // fills the fields; sandbox uses the seeded magic assertion fields.
      if (getMode() === "production") {
        const credentialId = el<HTMLInputElement>(
          "passkey-create-cred-id-raw",
        ).value.trim();
        const assertion = await signWithPasskey(challenge, credentialId);
        el<HTMLInputElement>("passkey-create-cred-id-raw").value =
          assertion.credentialId;
        el<HTMLInputElement>("passkey-verify-client-data-json").value =
          assertion.clientDataJson;
        el<HTMLInputElement>("passkey-verify-auth-data").value =
          assertion.authenticatorData;
        el<HTMLInputElement>("passkey-verify-signature").value =
          assertion.signature;
        addLog("Passkey Signed (real)", assertion);
      }

      return runPasskeyVerify(credId, requestId);
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
      const credId = el<HTMLInputElement>(
        "passkey-create-cred-id-raw",
      ).value.trim();
      const assertion = await signWithPasskey(passkeySessionChallenge, credId);
      el<HTMLInputElement>("passkey-create-cred-id-raw").value =
        assertion.credentialId;
      el<HTMLInputElement>("passkey-verify-client-data-json").value =
        assertion.clientDataJson;
      el<HTMLInputElement>("passkey-verify-auth-data").value =
        assertion.authenticatorData;
      el<HTMLInputElement>("passkey-verify-signature").value =
        assertion.signature;
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
        credentialId: el<HTMLInputElement>(
          "passkey-create-cred-id-raw",
        ).value.trim(),
        clientDataJson: el<HTMLInputElement>(
          "passkey-create-client-data-json",
        ).value.trim(),
        attestationObject: el<HTMLInputElement>(
          "passkey-create-attestation-object",
        ).value.trim(),
      },
    };
  }
  bindClick(
    "btn-passkey-add-issue",
    "passkey-add-issue-status",
    "PASSKEY Add (issue)",
    "Issuing add challenge...",
    async () => {
      const { data } = await apiPost(
        "/auth/credentials",
        buildPasskeyAddBody(),
      );
      addLog("PASSKEY Add (issue)", data);
      const d = data as Record<string, unknown>;
      if (d.requestId) passkeyAddRequestId.value = d.requestId as string;
      if (typeof d.payloadToSign === "string")
        passkeyAddPayloadToSign = d.payloadToSign;
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
      if (!requestId)
        throw new Error("Request-Id is required — run step 1 first.");
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
        {
          "Grid-Wallet-Signature": signature,
          "Request-Id": requestId,
        },
      );
      addLog("PASSKEY Add (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );

  // The add-retry stamps CREATE_AUTHENTICATORS with the live session's signing
  // key in production. Surface that requirement as a disabled-with-tooltip
  // button (re-evaluated on session + mode change) instead of throwing on
  // click — fixes the old "No client keypair" trap.
  const refreshAddRetryGate = wireGatedButton("btn-passkey-add-retry", () => {
    if (getMode() !== "production") return null; // sandbox uses the magic value
    if (!hasSessionSigningKey())
      return "Log in first — adding a passkey needs a live session to stamp the request.";
    return null;
  });
  onSessionChange(refreshAddRetryGate);
  maybeEl<HTMLSelectElement>("mode-select")?.addEventListener(
    "change",
    refreshAddRetryGate,
  );
}
