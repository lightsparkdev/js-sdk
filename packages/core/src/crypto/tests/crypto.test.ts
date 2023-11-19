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
});
