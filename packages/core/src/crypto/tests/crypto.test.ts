import { describe, expect, test } from "@jest/globals";
import { DefaultCrypto, b64encode } from "../../index.js";

describe("Crypto tests", () => {
  test("should generate a key", async () => {
    const { privateKey, publicKey } =
      await DefaultCrypto.generateSigningKeyPair();

    const serializedKeypair = {
      privateKey: b64encode(
        await DefaultCrypto.serializeSigningKey(privateKey, "pkcs8"),
      ),
      publicKey: b64encode(
        await DefaultCrypto.serializeSigningKey(publicKey, "spki"),
      ),
    };

    expect(serializedKeypair.privateKey).not.toBeNull();
    expect(serializedKeypair.publicKey).not.toBeNull();
  }, 60_000);

  test("should generate a valid nonce", async () => {
    const nonce = await DefaultCrypto.getNonce();
    expect(nonce > 0n).toBe(true);
  }, 10_000);

  test("should generate nonces that exceed Number.MAX_SAFE_INTEGER without precision loss", async () => {
    const nonces = await Promise.all(
      Array.from({ length: 100 }, () => DefaultCrypto.getNonce()),
    );
    const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

    for (const nonce of nonces) {
      expect(typeof nonce).toBe("bigint");
      // A 64-bit nonce converted to Number and back will lose precision if it
      // exceeds MAX_SAFE_INTEGER. Verify the round-trip is lossless:
      expect(BigInt(nonce.toString())).toBe(nonce);
    }
    // With 64 bits, at least some nonces should exceed MAX_SAFE_INTEGER. The
    // probability of all 100 fitting in 53 bits is negligible (~2^-1100).
    const hasLargeNonce = nonces.some((n: bigint) => n > maxSafeInteger);
    expect(hasLargeNonce).toBe(true);
  }, 10_000);
});
