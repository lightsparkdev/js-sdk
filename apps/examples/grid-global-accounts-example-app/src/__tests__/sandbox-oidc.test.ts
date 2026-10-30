import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { SANDBOX_OIDC_IDENTITY, sandboxOidcToken } from "../sandbox-oidc";

function payloadOf(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

describe("sandboxOidcToken", () => {
  it("carries the claims sandbox checks, with the nonce bound to the client key", async () => {
    const pub = "02a1b2c3";
    const before = Math.floor(Date.now() / 1000);
    const claims = payloadOf(
      await sandboxOidcToken(SANDBOX_OIDC_IDENTITY, pub),
    );

    expect(claims.iss).toBe(SANDBOX_OIDC_IDENTITY.issuer);
    expect(claims.aud).toBe(SANDBOX_OIDC_IDENTITY.audience);
    expect(claims.sub).toBe(SANDBOX_OIDC_IDENTITY.subject);
    expect(claims.iat).toBeGreaterThanOrEqual(before);
    expect(claims.exp).toBeGreaterThan(claims.iat as number);
    expect(claims.nonce).toBe(
      createHash("sha256").update(pub, "utf8").digest("hex"),
    );
  });

  it("omits the nonce on a create token, which binds to no key", async () => {
    const claims = payloadOf(await sandboxOidcToken(SANDBOX_OIDC_IDENTITY));
    expect(claims).not.toHaveProperty("nonce");
  });
});
