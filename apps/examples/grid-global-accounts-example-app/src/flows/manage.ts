// Shared signed-retry wiring per tab: delete credential / session / export, +
// list credentials / sessions.
//
// Endpoints are identical for all tabs — inputs come from the shared ctx, and
// the per-tab buttons just visually group each flow under the relevant tab.
// The three flows below are wired once per credential type in a single loop
// (`wireManageFlows`), replacing the previously inlined per-type duplication.

import { CredType, SANDBOX_SIG } from "../config";
import { apiDelete, apiGet, apiPost } from "../api-client";
import { addLog, bindClick, maybeEl } from "../ui";
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

function wireDeleteCredentialButtons(type: CredType): void {
  const reqInputId = `${type}-del-cred-request-id`;
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
}

function wireDeleteSessionButtons(type: CredType): void {
  const reqInputId = `${type}-del-session-request-id`;
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
}

function wireExportButtons(type: CredType): void {
  const reqInputId = `${type}-export-request-id`;
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
  for (const type of ["email_otp", "oauth", "passkey"] as const) {
    wireDeleteCredentialButtons(type);
    wireDeleteSessionButtons(type);
    wireExportButtons(type);
  }
  wireListButtons();
}
