import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { oidcNonceForPublicKey } from "../google-identity";
import { generateClientKeyPair } from "../turnkey";
import { setActiveSessionAccount } from "../session";

// The backend's sandbox_oidc_nonce_for_public_key / Turnkey enclave rule:
//   sha256(public_key.encode("utf-8")).hexdigest()
function backendNonce(publicKeyHex: string): string {
  return createHash("sha256").update(publicKeyHex, "utf8").digest("hex");
}

afterEach(() => {
  setActiveSessionAccount(null);
});

describe("oidcNonceForPublicKey", () => {
  it("matches sha256-hex of the public-key hex string (backend formula)", async () => {
    const pub = "02a1b2c3";
    expect(await oidcNonceForPublicKey(pub)).toBe(backendNonce(pub));
  });

  it("binds to the COMPRESSED session key the oauth flow generates", async () => {
    setActiveSessionAccount("InternalAccount:google");
    const kp = generateClientKeyPair();
    // 33-byte compressed P-256 point → 66 hex chars; the nonce must hash this
    // exact key, not the uncompressed encoding.
    expect(kp.publicKey.length).toBe(66);
    expect(await oidcNonceForPublicKey(kp.publicKey)).toBe(
      backendNonce(kp.publicKey),
    );
    expect(await oidcNonceForPublicKey(kp.publicKey)).not.toBe(
      backendNonce(kp.publicKeyUncompressed),
    );
  });
});
