// Sandbox OIDC tokens. Sandbox cannot verify a provider's signature, so it
// accepts a JWT-shaped token whose claims pass the checks Grid runs locally:
// a supported issuer, a stable identity, an `iat` under a minute old, a future
// `exp` and, on verify, a `nonce` bound to the client public key. A token is
// minted right before each request so `iat` is fresh.

import { oidcNonceForPublicKey } from "./google-identity";
import { bytesToB64Url } from "./webauthn";

export interface SandboxOidcIdentity {
  issuer: string;
  audience: string;
  subject: string;
}

// Verify must present the same iss/aud/sub the credential was created with,
// and a listed credential does not say which identity it holds. So every
// sandbox token carries this one identity. Adding OAuth to a wallet that
// already has it is refused by sandbox as a duplicate, the same as production.
export const SANDBOX_OIDC_IDENTITY: SandboxOidcIdentity = {
  issuer: "https://accounts.google.com",
  audience: "grid-sandbox-oauth-client-id",
  subject: "sandbox-user-1",
};

const TOKEN_LIFETIME_SECONDS = 300;

function b64UrlJson(value: unknown): string {
  return bytesToB64Url(new TextEncoder().encode(JSON.stringify(value)));
}

export async function sandboxOidcToken(
  identity: SandboxOidcIdentity,
  clientPublicKey?: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    iss: identity.issuer,
    aud: identity.audience,
    sub: identity.subject,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
    email: `${identity.subject}@example.com`,
    email_verified: true,
  };
  if (clientPublicKey !== undefined) {
    payload.nonce = await oidcNonceForPublicKey(clientPublicKey);
  }
  const header = { alg: "RS256", typ: "JWT" };
  return `${b64UrlJson(header)}.${b64UrlJson(payload)}.sandbox-signature`;
}
