import { secp256k1 } from "@noble/curves/secp256k1.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";

import { OWNER_KEY_MESSAGE, recoverCompressedPublicKey } from "../evm-wallet";

describe("recoverCompressedPublicKey", () => {
  it("recovers the signing wallet's own compressed secp256k1 key", async () => {
    // Several wallets so both y parities (02 and 03 prefixes) come up.
    for (let i = 0; i < 8; i++) {
      const wallet = privateKeyToAccount(generatePrivateKey());
      const signature = await wallet.signMessage({
        message: OWNER_KEY_MESSAGE,
      });
      const key = await recoverCompressedPublicKey(
        OWNER_KEY_MESSAGE,
        signature,
        wallet.address,
      );
      expect(key).toBe(
        `0x${secp256k1.Point.fromHex(wallet.publicKey.slice(2)).toHex(true)}`,
      );
    }
  });

  it("refuses a signature made by a different wallet", async () => {
    const signer = privateKeyToAccount(generatePrivateKey());
    const other = privateKeyToAccount(generatePrivateKey());
    const signature = await signer.signMessage({ message: OWNER_KEY_MESSAGE });
    await expect(
      recoverCompressedPublicKey(OWNER_KEY_MESSAGE, signature, other.address),
    ).rejects.toThrow();
  });
});
