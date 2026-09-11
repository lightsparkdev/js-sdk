// Login decision logic: given a wallet's existing credentials, decide whether a
// sign-in for a given method should AUTHENTICATE with an existing credential or
// CREATE a new one first.
//
// This is the fix for the production EMAIL_OTP bug where Login unconditionally
// ran the create-a-credential ceremony on every sign-in: once a credential of
// that type exists, POST /auth/credentials 400s with
// EMAIL_OTP_CREDENTIAL_ALREADY_EXISTS. The rule is simple — if a credential of
// the chosen method already exists, skip create and authenticate with its id;
// otherwise run the existing create+verify ceremony.
//
// Pure + DOM-free so it can be unit-tested at the flow boundary without touching
// real Turnkey.

/** The three sign-in methods the wallet supports. */
export type Method = "email_otp" | "oauth" | "passkey";

/** The credential `type` strings the Grid API returns for each method. */
const TYPE_FOR_METHOD: Record<Method, string> = {
  email_otp: "EMAIL_OTP",
  oauth: "OAUTH",
  passkey: "PASSKEY",
};

/** Reverse of `TYPE_FOR_METHOD`: the credential's API `type` → its `Method`. */
const METHOD_FOR_TYPE: Record<string, Method> = {
  EMAIL_OTP: "email_otp",
  OAUTH: "oauth",
  PASSKEY: "passkey",
};

/**
 * The `Method` a credential authenticates with, derived from its API `type`, or
 * undefined for an unrecognised type. The new login screen iterates the FULL
 * credential list (a wallet can hold multiple passkeys / oauth identities), so
 * each row maps its own credential to a method rather than collapsing the list
 * to one-per-type.
 */
export function methodForCredential(
  credential: ExistingCredential,
): Method | undefined {
  return credential.type ? METHOD_FOR_TYPE[credential.type] : undefined;
}

/** True when the wallet already has at least one EMAIL_OTP credential. A wallet
 *  may hold only one, so "Add Email OTP" is offered only when this is false. */
export function hasEmailOtpCredential(
  credentials: ExistingCredential[],
): boolean {
  return Boolean(existingCredentialFor(credentials, "email_otp"));
}

/** A credential as returned by GET /auth/credentials. */
export interface ExistingCredential {
  id: string;
  type?: string;
  nickname?: string;
  status?: string;
}

/** The decision for a single method: authenticate with an existing credential
 *  (skip create), or create a new one first. */
export type LoginDecision =
  | { action: "authenticate"; credId: string }
  | { action: "create" };

/**
 * Pull the credentials array out of a `listCredentials` response. The API wraps
 * the list as `{ data: Credential[] }`; we tolerate a bare array or a missing
 * payload too so callers don't have to special-case the empty/loading state.
 */
export function parseCredentials(raw: unknown): ExistingCredential[] {
  if (Array.isArray(raw)) return raw as ExistingCredential[];
  const data = (raw as { data?: unknown })?.data;
  return Array.isArray(data) ? (data as ExistingCredential[]) : [];
}

/**
 * The first existing credential for `method`, or undefined if the wallet has
 * none of that type. Credentials without a usable `id` are ignored (they can't
 * be authenticated against).
 */
export function existingCredentialFor(
  credentials: ExistingCredential[],
  method: Method,
): ExistingCredential | undefined {
  const wanted = TYPE_FOR_METHOD[method];
  return credentials.find((c) => c.type === wanted && Boolean(c.id));
}

/**
 * Decide whether signing in with `method` should authenticate against an
 * existing credential or create one first. This is the single source of truth
 * the Login UI and tests share.
 */
export function decideLogin(
  credentials: ExistingCredential[],
  method: Method,
): LoginDecision {
  const existing = existingCredentialFor(credentials, method);
  return existing
    ? { action: "authenticate", credId: existing.id }
    : { action: "create" };
}
