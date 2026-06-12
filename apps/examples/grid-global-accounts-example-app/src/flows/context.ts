// Cross-flow wallet context: account / credential / session ids shared between
// the per-credential-type tabs and the money + manage flows.

import { el } from "../ui";

let ctxAccountId: HTMLInputElement | null = null;
let ctxCredentialId: HTMLInputElement | null = null;
let ctxSessionId: HTMLInputElement | null = null;

function accountIdEl(): HTMLInputElement {
  if (!ctxAccountId) ctxAccountId = el<HTMLInputElement>("ctx-account-id");
  return ctxAccountId;
}
function credentialIdEl(): HTMLInputElement {
  if (!ctxCredentialId)
    ctxCredentialId = el<HTMLInputElement>("ctx-credential-id");
  return ctxCredentialId;
}
function sessionIdEl(): HTMLInputElement {
  if (!ctxSessionId) ctxSessionId = el<HTMLInputElement>("ctx-session-id");
  return ctxSessionId;
}

// First-call-wins by design: the account id is established once (Create
// Customer) and shared across every credential-type tab, so a later per-type
// flow must not clobber it. Credential/session ids below are per-type and do
// overwrite. To switch accounts, clear the field in the UI.
export function setCtxAccount(id: string): void {
  if (!accountIdEl().value) accountIdEl().value = id;
}
export function setCtxCredential(id: string): void {
  credentialIdEl().value = id;
}
export function setCtxSession(id: string): void {
  sessionIdEl().value = id;
}

export function requireAccountId(): string {
  const id = accountIdEl().value.trim();
  if (!id)
    throw new Error(
      "Internal Account ID is required — run Create Customer first.",
    );
  return id;
}

export function requireCredentialId(): string {
  const id = credentialIdEl().value.trim();
  if (!id)
    throw new Error(
      "Credential ID is required — run Create for this type first.",
    );
  return id;
}

export function requireSessionId(): string {
  const id = sessionIdEl().value.trim();
  if (!id)
    throw new Error("Session ID is required — run Verify for this type first.");
  return id;
}
