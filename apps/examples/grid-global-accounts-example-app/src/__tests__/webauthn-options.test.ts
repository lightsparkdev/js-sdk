import { describe, expect, it } from "vitest";

import {
  buildAllowCredentials,
  buildAssertionOptions,
  buildCreationOptions,
  bytesToB64Url,
  SECURITY_KEY_TRANSPORTS,
} from "../webauthn";

const RP = "localhost";

describe("buildCreationOptions — forces a cross-platform security key", () => {
  const challenge = new Uint8Array([1, 2, 3]);
  const userId = new Uint8Array([9, 9]);
  const opts = buildCreationOptions("My key", RP, challenge, userId);

  it("requests a cross-platform (roaming) authenticator, not the platform one", () => {
    expect(opts.authenticatorSelection?.authenticatorAttachment).toBe(
      "cross-platform",
    );
  });

  it("uses security-key-friendly resident-key + UV settings", () => {
    expect(opts.authenticatorSelection?.residentKey).toBe("discouraged");
    expect(opts.authenticatorSelection?.requireResidentKey).toBe(false);
    expect(opts.authenticatorSelection?.userVerification).toBe("preferred");
  });

  it("offers ES256 (-7) in pubKeyCredParams", () => {
    expect(opts.pubKeyCredParams).toContainEqual({
      type: "public-key",
      alg: -7,
    });
  });

  it("sets the rp id and passes the challenge/user through", () => {
    expect(opts.rp.id).toBe(RP);
    expect(opts.challenge).toBe(challenge);
    expect(opts.user.id).toBe(userId);
  });
});

describe("buildAllowCredentials — targets the security key over USB/NFC", () => {
  // A valid base64url credential id (decodes cleanly via atob).
  const idA = bytesToB64Url(new Uint8Array([10, 20, 30]));
  const idB = bytesToB64Url(new Uint8Array([40, 50, 60]));

  it("includes every registered id with usb/nfc transports", () => {
    const out = buildAllowCredentials([idA, idB]);
    expect(out).toHaveLength(2);
    for (const d of out) {
      expect(d.type).toBe("public-key");
      expect(d.transports).toEqual(SECURITY_KEY_TRANSPORTS);
      expect(d.transports).toEqual(["usb", "nfc"]);
    }
  });

  it("drops blank and duplicate ids", () => {
    const out = buildAllowCredentials([idA, "", "  ", idA]);
    expect(out).toHaveLength(1);
  });

  it("returns [] when no ids are known (discoverable-credential fallback)", () => {
    expect(buildAllowCredentials([])).toEqual([]);
  });
});

describe("buildAssertionOptions", () => {
  const challenge = new Uint8Array([7]);
  const id = bytesToB64Url(new Uint8Array([1, 2, 3, 4]));

  it("wires the rp id, challenge, UV and the allowCredentials", () => {
    const opts = buildAssertionOptions(challenge, [id], RP);
    expect(opts.rpId).toBe(RP);
    expect(opts.challenge).toBe(challenge);
    expect(opts.userVerification).toBe("preferred");
    expect(opts.allowCredentials).toHaveLength(1);
    expect(opts.allowCredentials?.[0].transports).toEqual(["usb", "nfc"]);
  });

  it("yields an empty allowCredentials when no ids are known", () => {
    const opts = buildAssertionOptions(challenge, [], RP);
    expect(opts.allowCredentials).toEqual([]);
  });
});
