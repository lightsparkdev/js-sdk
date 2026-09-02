// Cross-flow wallet context: account / credential / session ids shared between
// the per-credential-type tabs and the money + manage flows.
//
// State + chip rendering live in `session.ts`; these are the require-or-throw
// guards the flows use, plus thin re-exports of the setters so the chip stays
// in sync.

import {
  getAccountId,
  getCredentialId,
  getSessionId,
  setAccountId,
  setCredentialId,
  setSessionId,
} from "../session";

// Thin re-exports of the session setters so flows keep their familiar names.
// Note: `setCtxAccount`/`setAccountId` is first-call-wins by design (see
// session.ts) — the account id is established once and shared across tabs.
export const setCtxAccount = setAccountId;
export const setCtxCredential = setCredentialId;
export const setCtxSession = setSessionId;

export function requireAccountId(): string {
  const id = getAccountId();
  if (!id)
    throw new Error(
      "Internal Account ID is required — run Create Customer first.",
    );
  return id;
}

export function requireCredentialId(): string {
  const id = getCredentialId();
  if (!id)
    throw new Error(
      "Credential ID is required — run Create for this type first.",
    );
  return id;
}

export function requireSessionId(): string {
  const id = getSessionId();
  if (!id)
    throw new Error("Session ID is required — run Verify for this type first.");
  return id;
}
