// Shared signed-retry wiring per tab: delete credential / session / export, +
// list credentials / sessions.
//
// Endpoints are identical for all tabs — inputs come from the shared ctx, and
// the per-tab buttons just visually group each flow under the relevant tab.
// The three flows below are wired once per credential type in a single loop
// (`wireManageFlows`), replacing the previously inlined per-type duplication.
//
// Each action exposes two surfaces:
//   - a guided button that owns the whole issue → sign → retry chain in one
//     click, pulling the signature from the live session in production and from
//     `SANDBOX_SIG` in sandbox; and
//   - the raw issue/retry buttons (under the Advanced toggle in index.html) for
//     inspecting the 202 `requestId` / `payloadToSign` between legs.

import { CredType, SANDBOX_SIG } from "../config";
import { apiDelete, apiGet, apiPost, getMode } from "../api-client";
import { turnkeyStamp } from "../turnkey";
import { addLog, bindClick, maybeEl, wireGatedButton } from "../ui";
import { hasSessionSigningKey, onSessionChange } from "../session";
import {
  requireAccountId,
  requireCredentialId,
  requireSessionId,
} from "./context";

// Request-Id inputs are looked up lazily inside the handlers (via `maybeEl`)
// rather than captured eagerly with `el()` at wire time, matching `bindClick`'s
// graceful-skip pattern: a missing element degrades just that one button
// instead of throwing and aborting the rest of `wireManageFlows`.
function requestIdInput(id: string): HTMLInputElement | null {
  return maybeEl<HTMLInputElement>(id);
}

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
  payloadToSign: string | undefined,
): Promise<string> {
  if (getMode() !== "production") return SANDBOX_SIG;
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

// Run a guided issue → sign → retry chain: issue the 202, derive the signature
// (session stamp in production, magic value in sandbox), then forward the
// signed retry. Returns a summary of both legs.
async function runGuidedRetry(
  label: string,
  issue: IssueLeg,
  retry: RetryLeg,
): Promise<string> {
  const issued = await issue();
  addLog(`${label} (issue)`, issued);
  const requestId = requestIdFrom(issued);
  if (!requestId)
    throw new Error(`No requestId in the ${label} 202 challenge.`);
  const signature = await guidedSignature(payloadFrom(issued));
  const { data } = await retry({
    "Grid-Wallet-Signature": signature,
    "Request-Id": requestId,
  });
  addLog(`${label} (retry)`, data);
  return JSON.stringify({ issued, retried: data }, null, 2);
}

// Guided buttons that stamp a real payload in production need a live session;
// surface that as disabled-with-tooltip (re-evaluated on session + mode change)
// instead of throwing on click. Returns the refresh callback so the caller can
// register it once after wiring.
function gateGuidedButton(btnId: string): () => void {
  return wireGatedButton(btnId, () => {
    if (getMode() !== "production") return null; // sandbox uses the magic value
    if (!hasSessionSigningKey())
      return "Log in first — a signed retry needs a live session to stamp the request.";
    return null;
  });
}

function wireDeleteCredentialButtons(type: CredType): () => void {
  const reqInputId = `${type}-del-cred-request-id`;

  // ----- Guided: Delete credential -----
  bindClick(
    `btn-${type}-del-cred-guided`,
    `${type}-del-cred-guided-status`,
    "Delete Credential",
    "Deleting credential...",
    async () => {
      const credId = requireCredentialId();
      const path = `/auth/credentials/${encodeURIComponent(credId)}`;
      return runGuidedRetry(
        "Delete Credential",
        () => apiDelete(path).then((r) => r.data),
        (headers) => apiDelete(path, headers),
      );
    },
  );

  // ----- Manual (advanced): issue + retry as separate steps -----
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
      const reqInput = requestIdInput(reqInputId);
      if (d.requestId && reqInput) reqInput.value = d.requestId as string;
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
      const requestId = requestIdInput(reqInputId)?.value.trim() ?? "";
      if (!requestId)
        throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiDelete(
        `/auth/credentials/${encodeURIComponent(credId)}`,
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Delete Credential (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );

  return gateGuidedButton(`btn-${type}-del-cred-guided`);
}

function wireDeleteSessionButtons(type: CredType): () => void {
  const reqInputId = `${type}-del-session-request-id`;

  // ----- Guided: Delete session -----
  bindClick(
    `btn-${type}-del-session-guided`,
    `${type}-del-session-guided-status`,
    "Delete Session",
    "Deleting session...",
    async () => {
      const sid = requireSessionId();
      const path = `/auth/sessions/${encodeURIComponent(sid)}`;
      return runGuidedRetry(
        "Delete Session",
        () => apiDelete(path).then((r) => r.data),
        (headers) => apiDelete(path, headers),
      );
    },
  );

  // ----- Manual (advanced): issue + retry as separate steps -----
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
      const reqInput = requestIdInput(reqInputId);
      if (d.requestId && reqInput) reqInput.value = d.requestId as string;
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
      const requestId = requestIdInput(reqInputId)?.value.trim() ?? "";
      if (!requestId)
        throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiDelete(
        `/auth/sessions/${encodeURIComponent(sid)}`,
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Delete Session (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );

  return gateGuidedButton(`btn-${type}-del-session-guided`);
}

function wireExportButtons(type: CredType): () => void {
  const reqInputId = `${type}-export-request-id`;

  // ----- Guided: Wallet export -----
  bindClick(
    `btn-${type}-export-guided`,
    `${type}-export-guided-status`,
    "Wallet Export",
    "Exporting wallet...",
    async () => {
      const accountId = requireAccountId();
      const path = `/internal-accounts/${encodeURIComponent(accountId)}/export`;
      return runGuidedRetry(
        "Wallet Export",
        () => apiPost(path, {}).then((r) => r.data),
        (headers) => apiPost(path, {}, headers),
      );
    },
  );

  // ----- Manual (advanced): issue + retry as separate steps -----
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
      const reqInput = requestIdInput(reqInputId);
      if (d.requestId && reqInput) reqInput.value = d.requestId as string;
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
      const requestId = requestIdInput(reqInputId)?.value.trim() ?? "";
      if (!requestId)
        throw new Error("Request-Id is required — run step 1 first.");
      const { data } = await apiPost(
        `/internal-accounts/${encodeURIComponent(accountId)}/export`,
        {},
        { "Grid-Wallet-Signature": SANDBOX_SIG, "Request-Id": requestId },
      );
      addLog("Wallet Export (retry)", data);
      return JSON.stringify(data, null, 2);
    },
  );

  return gateGuidedButton(`btn-${type}-export-guided`);
}

function wireListButtons(): void {
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
}

export function wireManageFlows(): void {
  const refreshers: Array<() => void> = [];
  for (const type of ["email_otp", "oauth", "passkey"] as const) {
    refreshers.push(wireDeleteCredentialButtons(type));
    refreshers.push(wireDeleteSessionButtons(type));
    refreshers.push(wireExportButtons(type));
  }
  wireListButtons();

  // Re-evaluate every guided gate when the session or mode changes, so the
  // disabled-with-tooltip state stays accurate as the user logs in / switches.
  const refreshAll = () => refreshers.forEach((r) => r());
  onSessionChange(refreshAll);
  document
    .getElementById("mode-select")
    ?.addEventListener("change", refreshAll);
}
