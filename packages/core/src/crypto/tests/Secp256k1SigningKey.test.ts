import { describe, expect, test } from "@jest/globals";
import { bytesToHex, hexToBytes } from "../../utils/hex.js";
import { Secp256k1SigningKey } from "../SigningKey.js";

/** Parse a DER-encoded ECDSA signature and return its structure. */
function parseDER(bytes: Uint8Array) {
  let offset = 0;
  const tag = bytes[offset++];
  // outer SEQUENCE tag
  expect(tag).toBe(0x30);

  let totalLen = bytes[offset++];
  // handle lengths > 127 (multi-byte length encoding)
  if (totalLen & 0x80) {
    const numBytes = totalLen & 0x7f;
    totalLen = 0;
    for (let i = 0; i < numBytes; i++) {
      totalLen = (totalLen << 8) | bytes[offset++];
    }
  }

  // Parse r INTEGER
  expect(bytes[offset++]).toBe(0x02); // INTEGER tag
  const rLen = bytes[offset++];
  const r = bytes.slice(offset, offset + rLen);
  offset += rLen;

  // Parse s INTEGER
  expect(bytes[offset++]).toBe(0x02); // INTEGER tag
  const sLen = bytes[offset++];
  const s = bytes.slice(offset, offset + sLen);
  offset += sLen;

  // Should have consumed everything
  expect(offset).toBe(bytes.length);

  return { r, rLen, s, sLen, totalLen };
}

/** Verify DER structure is valid for an ECDSA secp256k1 signature. */
function assertValidDER(sigBytes: Uint8Array) {
  const { r, s, rLen, sLen } = parseDER(sigBytes);

  // r and s should be 32 or 33 bytes (33 if leading zero for sign bit)
  expect(rLen).toBeGreaterThanOrEqual(1);
  expect(rLen).toBeLessThanOrEqual(33);
  expect(sLen).toBeGreaterThanOrEqual(1);
  expect(sLen).toBeLessThanOrEqual(33);

  // If 33 bytes, the first byte must be 0x00 (padding for positive sign)
  if (rLen === 33) expect(r[0]).toBe(0x00);
  if (sLen === 33) expect(s[0]).toBe(0x00);

  // s must be in low-S form (both libraries default to lowS: true)
  // The secp256k1 curve order n/2 high byte is 0x7F...
  // A low-S value's first non-zero byte (after optional 0x00 pad) must be <= 0x7F
  const sValue = sLen === 33 ? s.slice(1) : s;
  expect(sValue[0]).toBeLessThanOrEqual(0x7f);
}

/* ---------- test keys ------------------------------------------------ */

// Well-known test keys (from BIP-32 test vectors, not used for real funds)
const TEST_KEYS = {
  key1: "e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35",
  key2: "0000000000000000000000000000000000000000000000000000000000000001",
  key3: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
  // Random but fixed key
  key4: "a3fd2b4f5e6c7d8a9b0c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f708",
};

/* ---------- test cases ----------------------------------------------- */

const TEST_VECTORS: Array<{
  name: string;
  key: string;
  messageHex: string;
  expectedSigHex: string;
}> = [
  {
    name: "key1 + empty message",
    key: TEST_KEYS.key1,
    messageHex: "",
    expectedSigHex:
      "3045022100abf6d5fc099a738944afa491783ea0abf3981959808850d86d167853fdeafd0202202dfb6f08fdb7c7d583022761d2ac3734ae81b6185c28783ff114ad0390a6d163",
  },
  {
    name: "key1 + 'test message'",
    key: TEST_KEYS.key1,
    messageHex: bytesToHex(new TextEncoder().encode("test message")),
    expectedSigHex:
      "3044022036e786a9664f71abcd44f0ff32b64a6e5212a18efa5ca57ba9dc9179991cd108022049ffc43f7840653d6470d5b1981ad22b7c5bcda15b26c6e9464451e47249bef8",
  },
  {
    name: "key1 + 'hello world'",
    key: TEST_KEYS.key1,
    messageHex: bytesToHex(new TextEncoder().encode("hello world")),
    expectedSigHex:
      "30440220767b1a1842e64c18f6e3983f173b83174c0776de5f207265ad417162a924f66e0220068bfb0814aea346eefb2bc85225a74f4762d7c376e98d807d4a70c3ce266480",
  },
  {
    name: "key1 + single zero byte",
    key: TEST_KEYS.key1,
    messageHex: "00",
    expectedSigHex:
      "3045022100f6a24b6b335dce767af4c5c0f6f08d2871f75e3227128baf256a3a74f409dd9602205c271c276b8913d98ba05fb513ed1cbf0284927aefbbb8999a91cd081ce8114d",
  },
  {
    name: "key1 + single 0xff byte",
    key: TEST_KEYS.key1,
    messageHex: "ff",
    expectedSigHex:
      "3044022039cf537339901a19a6f50f280760b18bc0e6cb2cfbc3ffcb212a672dc31a8d070220391d90f0d6775bcdfaf73c585558381838382eca108bf79d4d1ee4b4437c603f",
  },
  {
    name: "key1 + 32 zero bytes (looks like a hash)",
    key: TEST_KEYS.key1,
    messageHex: "00".repeat(32),
    expectedSigHex:
      "3045022100a6c97d383fa27dcfaef3664831d63db7a6b12e415e00fa2e134de1ec519cae8e02205570dcd6a94beed0715444e4bad86495f402dbdb625de0efa20ccf347ea7a43a",
  },
  {
    name: "key1 + 256 bytes of sequential data",
    key: TEST_KEYS.key1,
    messageHex: Array.from({ length: 256 }, (_, i) =>
      i.toString(16).padStart(2, "0"),
    ).join(""),
    expectedSigHex:
      "3044022052ee02a14c1f64907f41e470c3b00c73b7a010105df0d0d66b99707ab6352b4c022064d99357bd9c31e4e6fb37844ea3c442b4eaf5a5d16a31d955a9c9a3a17dad29",
  },
  {
    name: "key2 (smallest valid key) + 'test message'",
    key: TEST_KEYS.key2,
    messageHex: bytesToHex(new TextEncoder().encode("test message")),
    expectedSigHex:
      "3045022100fab80f0a195c3481c924f3a84729dbb4317c1e98b2b856be21712b2006c14f7a02200b9d3f1dbab6b9f4f37f7aee76e259069c9e2438ad0fd95a77d9fe4dcbb6cdbe",
  },
  {
    name: "key3 (near curve order) + 'test message'",
    key: TEST_KEYS.key3,
    messageHex: bytesToHex(new TextEncoder().encode("test message")),
    expectedSigHex:
      "3045022100c32d992fb5a08fcd1e54f8978fece3d3d787ab12457996f35819acc024de4f5702204ff52c357699851f6d362850d57cd215733bb6420aad0eda73e519a9062d3eae",
  },
  {
    name: "key4 + 'test message'",
    key: TEST_KEYS.key4,
    messageHex: bytesToHex(new TextEncoder().encode("test message")),
    expectedSigHex:
      "3045022100e3034b1ce07b08ed8558866e95591d1e60c6ef7edd092583ef3903cc09626e1702204e4be959ed8d5905bc3903cd1958307d9300fa36d754c932ed756b580b8cab56",
  },
  {
    name: "key4 + long repeated pattern (1KB)",
    key: TEST_KEYS.key4,
    messageHex: "deadbeef".repeat(256),
    expectedSigHex:
      "3045022100f342cbad7fbccf56094dc27bbef448cdff8cc4784d8597cbfbc064e72c14343102207b0a09c74fa8c7298279a7bf8ca98b45f1e8bf8201b468f5548156c5e678d5dd",
  },
  {
    name: "key2 + empty message",
    key: TEST_KEYS.key2,
    messageHex: "",
    expectedSigHex:
      "3044022077c8d336572f6f466055b5f70f433851f8f535f6c4fc71133a6cfd71079d03b702200ed9f5eb8aa5b266abac35d416c3207e7a538bf5f37649727d7a9823b1069577",
  },
  {
    name: "key3 + empty message",
    key: TEST_KEYS.key3,
    messageHex: "",
    expectedSigHex:
      "3045022100ea045bf0962ecc4d5aa84c8e716c87c9d5f49fba8e1ff0300ab2631de3d83b43022051270ec8105346fddf35da5958d99ff55a0c0f720d6ae7f3e3eadd40a9ccfe0e",
  },
];

/* ---------- tests ---------------------------------------------------- */

describe("Secp256k1SigningKey", () => {
  describe("deterministic signature vectors", () => {
    for (const vector of TEST_VECTORS) {
      test(vector.name, async () => {
        const signingKey = new Secp256k1SigningKey(vector.key);
        const message = hexToBytes(vector.messageHex);

        const signature = await signingKey.sign(message);
        const sigBytes = new Uint8Array(signature);
        const sigHex = bytesToHex(sigBytes);

        assertValidDER(sigBytes);
        expect(sigHex).toBe(vector.expectedSigHex);
      });
    }
  });

  describe("determinism (same key+message → same signature)", () => {
    test("10 sequential signs produce identical output", async () => {
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      const message = new TextEncoder().encode("determinism check");

      const signatures: string[] = [];
      for (let i = 0; i < 10; i++) {
        const sig = await signingKey.sign(message);
        signatures.push(bytesToHex(new Uint8Array(sig)));
      }

      const first = signatures[0];
      for (const sig of signatures) {
        expect(sig).toBe(first);
      }
    });
  });

  describe("DER encoding structure", () => {
    test("signature starts with 0x30 SEQUENCE tag", async () => {
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      const sig = new Uint8Array(
        await signingKey.sign(new TextEncoder().encode("DER check")),
      );
      expect(sig[0]).toBe(0x30);
    });

    test("signature contains exactly two INTEGERs", async () => {
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      const sig = new Uint8Array(
        await signingKey.sign(new TextEncoder().encode("DER structure")),
      );
      const { r, s } = parseDER(sig);
      // Both r and s should be non-empty
      expect(r.length).toBeGreaterThan(0);
      expect(s.length).toBeGreaterThan(0);
    });

    test("total DER length matches actual byte length", async () => {
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      for (const msg of ["a", "bb", "ccc", "dddd"]) {
        const sig = new Uint8Array(
          await signingKey.sign(new TextEncoder().encode(msg)),
        );
        // DER: 0x30 <len> <contents>
        // Total bytes = 2 (tag+len) + contents length
        const contentLen = sig[1];
        expect(sig.length).toBe(2 + contentLen);
      }
    });
  });

  describe("different keys produce different signatures for same message", () => {
    test("all test keys produce unique signatures", async () => {
      const message = new TextEncoder().encode("unique check");
      const sigs = new Set<string>();

      for (const key of Object.values(TEST_KEYS)) {
        const signingKey = new Secp256k1SigningKey(key);
        const sig = await signingKey.sign(message);
        sigs.add(bytesToHex(new Uint8Array(sig)));
      }

      expect(sigs.size).toBe(Object.keys(TEST_KEYS).length);
    });
  });

  describe("different messages produce different signatures for same key", () => {
    test("varied messages produce unique signatures", async () => {
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      const messages = [
        "message 1",
        "message 2",
        "message 3",
        "",
        "a",
        "ab",
        "abc",
      ];
      const sigs = new Set<string>();

      for (const msg of messages) {
        const sig = await signingKey.sign(new TextEncoder().encode(msg));
        sigs.add(bytesToHex(new Uint8Array(sig)));
      }

      expect(sigs.size).toBe(messages.length);
    });
  });

  describe("signature byte length is reasonable", () => {
    test("DER signatures are between 68 and 72 bytes", async () => {
      // DER-encoded secp256k1 signatures are typically 70-72 bytes
      // but can be as short as 68 if both r and s have no leading zero
      const signingKey = new Secp256k1SigningKey(TEST_KEYS.key1);
      for (let i = 0; i < 20; i++) {
        const msg = new TextEncoder().encode(`length check ${i}`);
        const sig = new Uint8Array(await signingKey.sign(msg));
        expect(sig.length).toBeGreaterThanOrEqual(68);
        expect(sig.length).toBeLessThanOrEqual(72);
      }
    });
  });
});
