// OAUTH lifecycle: create, verify (→ session), add.

import { SANDBOX_SIG } from "../config";
import { apiPost } from "../api-client";
import { rememberEncryptedSessionSigningKey } from "../session";
import { addLog, bindClick, el, wireGenKeyButton } from "../ui";
import {
  requireAccountId,
  requireCredentialId,
  setCtxCredential,
  setCtxSession,
} from "./context";

export function wireOauthFlows(): void {
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
      if (!oidc || !pubkey)
        throw new Error("OIDC token and public key are required.");
      const { data } = await apiPost(
        `/auth/credentials/${encodeURIComponent(credId)}/verify`,
        { type: "OAUTH", oidcToken: oidc, clientPublicKey: pubkey },
      );
      addLog("OAUTH Verify", data);
      const d = data as Record<string, unknown>;
      if (d.id) setCtxSession(d.id as string);
      // MIGRATION (P6): OAUTH login moves to OAUTH_LOGIN; the knob-ON response
      // drops `encryptedSessionSigningKey`, so this becomes the OTP-style
      // `setSessionKeysFromTek(clientKeyPair)` path. The shape-detection in
      // `rememberEncryptedSessionSigningKey` already no-ops when the field is
      // absent — flip this one call once the P3 wire shape settles.
      rememberEncryptedSessionSigningKey(d.encryptedSessionSigningKey);
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
}
