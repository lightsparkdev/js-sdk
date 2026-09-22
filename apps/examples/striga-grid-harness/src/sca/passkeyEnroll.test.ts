import { describe, expect, it } from "vitest";

import {
  encodeAttestation,
  toCreationOptions,
  type EnrollPasskeyOptions,
} from "./passkeyEnroll";
import { bytesToB64Url } from "./passkeyLogin";

const challenge = new Uint8Array([9, 8, 7, 6]);
const userId = new Uint8Array([4, 4, 4]);
const excludeId = new Uint8Array([1, 2, 3, 4, 5]);

function baseOptions(): EnrollPasskeyOptions {
  return {
    challenge: bytesToB64Url(challenge),
    rp: { id: "localhost", name: "Striga" },
    user: {
      id: bytesToB64Url(userId),
      name: "harness@example.com",
      displayName: "Harness User",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    timeout: 60000,
    attestation: "none",
    authenticatorSelection: { userVerification: "required" },
    excludeCredentials: [{ type: "public-key", id: bytesToB64Url(excludeId) }],
  };
}

describe("toCreationOptions — decodes the enrollment/start options", () => {
  const opts = toCreationOptions(baseOptions());

  it("base64url-decodes the challenge to bytes", () => {
    expect(Array.from(new Uint8Array(opts.challenge as ArrayBuffer))).toEqual(
      Array.from(challenge),
    );
  });

  it("decodes the user id, which is binary unlike the other user fields", () => {
    expect(Array.from(new Uint8Array(opts.user.id as ArrayBuffer))).toEqual(
      Array.from(userId),
    );
    expect(opts.user.name).toBe("harness@example.com");
    expect(opts.user.displayName).toBe("Harness User");
  });

  it("decodes each excludeCredentials id and forces the public-key type", () => {
    expect(opts.excludeCredentials).toHaveLength(1);
    const cred = opts.excludeCredentials![0];
    expect(cred.type).toBe("public-key");
    expect(Array.from(new Uint8Array(cred.id as ArrayBuffer))).toEqual(
      Array.from(excludeId),
    );
  });

  it("passes rp, params, timeout and selection through", () => {
    expect(opts.rp).toEqual({ id: "localhost", name: "Striga" });
    expect(opts.pubKeyCredParams).toEqual([{ type: "public-key", alg: -7 }]);
    expect(opts.timeout).toBe(60000);
    expect(opts.attestation).toBe("none");
    expect(opts.authenticatorSelection).toEqual({
      userVerification: "required",
    });
  });

  it("yields an empty excludeCredentials when none are supplied", () => {
    const bare = toCreationOptions({
      ...baseOptions(),
      excludeCredentials: undefined,
    });
    expect(bare.excludeCredentials).toEqual([]);
  });

  it("defaults pubKeyCredParams to ES256 + RS256 when the server omits them", () => {
    const bare = toCreationOptions({
      ...baseOptions(),
      pubKeyCredParams: undefined,
    });
    expect(bare.pubKeyCredParams).toEqual([
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ]);
  });
});

describe("encodeAttestation — serializes the registration credential", () => {
  const rawId = new Uint8Array([10, 20, 30]);
  const clientDataJSON = new Uint8Array([1, 1, 2]);
  const attestationObject = new Uint8Array([3, 5, 8]);

  function fakeCredential(getTransports?: () => string[]): PublicKeyCredential {
    return {
      id: "credential-id",
      rawId: rawId.buffer,
      type: "public-key",
      response: {
        clientDataJSON: clientDataJSON.buffer,
        attestationObject: attestationObject.buffer,
        ...(getTransports ? { getTransports } : {}),
      },
      getClientExtensionResults: () => ({}),
    } as unknown as PublicKeyCredential;
  }

  it("base64url-encodes every binary field", () => {
    const out = encodeAttestation(fakeCredential());
    expect(out.id).toBe("credential-id");
    expect(out.type).toBe("public-key");
    expect(out.rawId).toBe(bytesToB64Url(rawId));
    expect(out.response.clientDataJSON).toBe(bytesToB64Url(clientDataJSON));
    expect(out.response.attestationObject).toBe(
      bytesToB64Url(attestationObject),
    );
  });

  it("includes transports when the authenticator reports them", () => {
    const out = encodeAttestation(fakeCredential(() => ["internal", "hybrid"]));
    expect(out.response.transports).toEqual(["internal", "hybrid"]);
  });

  it("omits transports when the authenticator has no getTransports", () => {
    expect(
      encodeAttestation(fakeCredential()).response.transports,
    ).toBeUndefined();
  });

  // Striga rejects the confirm body unless these three are present strings, so
  // an encoding regression here surfaces as an opaque 400 rather than a crash.
  it("carries the fields Striga validates on the confirm payload", () => {
    const out = encodeAttestation(fakeCredential());
    for (const value of [out.id, out.type, out.response.clientDataJSON]) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
