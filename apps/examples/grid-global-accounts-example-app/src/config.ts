// Grid Global Accounts — Example App: shared config + constants.

export type Mode = "sandbox" | "production";
export type CredType = "email_otp" | "oauth" | "passkey";

// Which SEC1 encoding of the client public key passkey/oauth login sends as
// `clientPublicKey`. The Grid backend dispatches the login model off this
// encoding: "modern" (compressed) registers a client-held session key, "legacy"
// (uncompressed) routes to the server HPKE-bundle model. Defaults to "modern".
export type LoginKeyEncoding = "modern" | "legacy";

// Sandbox magic signature injected into signed-retry headers and the execute
// signature. In production these are wrong — a real stamp must be supplied.
export const SANDBOX_SIG = "sandbox-valid-signature";

// All requests proxy through Vite at `/api` and forward to the configured Grid
// backend. Credentials are entered manually in the UI — never embedded.
export const API_BASE = "/api";

// Turnkey API stamp scheme — must match what `@turnkey/api-key-stamper` emits.
export const TURNKEY_STAMP_SCHEME = "SIGNATURE_SCHEME_TK_API_P256";

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
// The single source of truth for every fake "looks-real" field. Keyed by input
// element id → the magic value the sandbox backend accepts. In sandbox mode
// these are seeded into the fields (and the field gets a "magic" pill) by
// `mode.ts`; in production mode the same fields are hidden so nothing fake is
// ever on screen. This replaces the scattered `value="sandbox-..."` attributes
// that made fake data indistinguishable from real values.
export const SANDBOX_MAGIC: Record<string, string> = {
  // EMAIL_OTP — sandbox always accepts the fixed code.
  "email_otp-v3-code": "000000",
  // OAUTH — magic OIDC tokens (verify input + JWT-shaped create/add identities).
  "oauth-verify-oidc": "sandbox-valid-oidc-token",
  "oauth-create-oidc":
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiJzYW5kYm94LXVzZXItMSJ9.sig",
  "oauth-add-oidc":
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwic3ViIjoic2FuZGJveC11c2VyLTIifQ.sig",
  // PASSKEY — magic attestation (create) + assertion (verify) blobs.
  "passkey-create-challenge": "c2FuZGJveC1jaGFsbGVuZ2U",
  "passkey-create-cred-id-raw": "c2FuZGJveC1jcmVkLWlk",
  "passkey-create-client-data-json": "c2FuZGJveC1jbGllbnREYXRhSlNPTg",
  "passkey-create-attestation-object": "c2FuZGJveC1hdHRlc3RhdGlvbk9iamVjdA",
  "passkey-verify-signature": "sandbox-valid-passkey-signature",
  "passkey-verify-auth-data": "c2FuZGJveC1hdXRoLWRhdGE",
  "passkey-verify-client-data-json": "c2FuZGJveC1jbGllbnQtZGF0YQ",
};
