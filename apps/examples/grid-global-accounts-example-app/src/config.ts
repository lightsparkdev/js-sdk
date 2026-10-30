// Grid Global Accounts — Example App: shared config + constants.

export type Mode = "sandbox" | "production";
export type CredType = "email_otp" | "oauth" | "passkey";

// Which SEC1 encoding of the client public key passkey/oauth login sends as
// `clientPublicKey`. The Grid backend dispatches the login model off this
// encoding: "modern" (compressed) registers a client-held session key, "legacy"
// (uncompressed) routes to the server HPKE-bundle model. Defaults to "modern".
export type LoginKeyEncoding = "modern" | "legacy";

// All requests proxy through Vite at `/api` and forward to the configured Grid
// backend. Credentials are entered manually in the UI — never embedded.
export const API_BASE = "/api";

// Turnkey API stamp scheme — must match what `@turnkey/api-key-stamper` emits.
export const TURNKEY_STAMP_SCHEME = "SIGNATURE_SCHEME_TK_API_P256";

// Google OAuth Web client ID for "Sign in with Google" (public — no secret).
// Supply your own via VITE_GOOGLE_CLIENT_ID; empty hides the button.
export const GOOGLE_OAUTH_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// `localStorage` key for the persisted mode so a reload keeps the chosen mode
// instead of silently reverting to sandbox.
export const MODE_STORAGE_KEY = "gga-example-app-mode";

// `localStorage` key for the persisted login key encoding (legacy vs modern),
// backing the "Login session key" toggle on the customer Login screen so a
// tester can flip which login path the app exercises and have it survive a
// reload. Defaults to "modern" when unset.
export const LOGIN_KEY_ENCODING_STORAGE_KEY =
  "gga-example-app-login-key-encoding";

// ----- Sandbox magic values -----
//
// The fixed values the sandbox backend accepts, keyed by input element id. In
// sandbox mode these are seeded into the fields by `mode.ts`; in production
// mode the same fields are hidden so nothing fake is ever on screen. The OTP
// code is the only one left: sandbox verifies signatures, passkey assertions
// and OIDC tokens for real, and `sandbox-oidc.ts` mints the latter.
export const SANDBOX_MAGIC: Record<string, string> = {
  "email_otp-v3-code": "000000",
};
