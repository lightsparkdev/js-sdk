import { describe, expect, it } from "vitest";

import { base32Decode, computeTotp } from "./totp";

// RFC 6238 Appendix B test seed: the ASCII string "12345678901234567890"
// (20 bytes), base32-encoded. The published vectors are 8 digits; the harness
// truncates to 6, so we assert the low 6 digits of each.
const SEED = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("base32Decode", () => {
  it("decodes to the original ASCII bytes", () => {
    const decoded = base32Decode("GEZDGNBVGY3TQOJQ");
    expect(new TextDecoder().decode(decoded)).toBe("1234567890");
  });

  it("ignores casing and trailing padding", () => {
    expect(Array.from(base32Decode("gezdgnbvgy3tqojq"))).toEqual(
      Array.from(base32Decode("GEZDGNBVGY3TQOJQ")),
    );
  });
});

describe("computeTotp — RFC 6238 SHA-1 vectors (6-digit)", () => {
  const cases: [number, string][] = [
    [59_000, "287082"], // 8-digit 94287082
    [1_111_111_109_000, "081804"], // 07081804
    [1_234_567_890_000, "005924"], // 89005924
    [2_000_000_000_000, "279037"], // 69279037
  ];

  for (const [nowMs, expected] of cases) {
    it(`t=${nowMs / 1000}s → ${expected}`, async () => {
      expect(await computeTotp(SEED, 30, 6, nowMs)).toBe(expected);
    });
  }
});
