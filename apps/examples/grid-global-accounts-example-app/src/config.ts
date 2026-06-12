// Grid Global Accounts — Example App: shared config + constants.

export type Mode = "sandbox" | "production";
export type CredType = "email_otp" | "oauth" | "passkey";

// Sandbox magic signature injected into signed-retry headers and the execute
// signature. In production these are wrong — a real stamp must be supplied.
export const SANDBOX_SIG = "sandbox-valid-signature";

// All requests proxy through Vite at `/api` and forward to the configured Grid
// backend. Credentials are entered manually in the UI — never embedded.
export const API_BASE = "/api";

// Turnkey API stamp scheme — must match what `@turnkey/api-key-stamper` emits.
export const TURNKEY_STAMP_SCHEME = "SIGNATURE_SCHEME_TK_API_P256";
