import { describe, expect, it } from "vitest";

import {
  b64UrlToBytes,
  bytesToB64Url,
  encodeAssertion,
  toRequestOptions,
} from "./passkeyLogin";

describe("bytesToB64Url / b64UrlToBytes round-trip", () => {
  it("survives bytes with +, / and padding in standard base64", () => {
    const bytes = new Uint8Array([251, 255, 0, 62, 63, 1, 2, 3]);
    expect(Array.from(b64UrlToBytes(bytesToB64Url(bytes)))).toEqual(
      Array.from(bytes),
    );
  });

  it("emits url-safe, unpadded output", () => {
    const encoded = bytesToB64Url(new Uint8Array([251, 255, 62, 63]));
    expect(encoded).not.toMatch(/[+/=]/);
  });
});

describe("toRequestOptions — decodes the login/start options", () => {
  const challenge = new Uint8Array([9, 8, 7, 6]);
  const credId = new Uint8Array([1, 2, 3, 4, 5]);
  const opts = toRequestOptions({
    challenge: bytesToB64Url(challenge),
    timeout: 60000,
    rpId: "localhost",
    userVerification: "required",
    allowCredentials: [{ type: "public-key", id: bytesToB64Url(credId) }],
  });

  it("base64url-decodes the challenge to bytes", () => {
    expect(Array.from(new Uint8Array(opts.challenge as ArrayBuffer))).toEqual(
      Array.from(challenge),
    );
  });

  it("decodes each allowCredentials id and forces the public-key type", () => {
    expect(opts.allowCredentials).toHaveLength(1);
    const cred = opts.allowCredentials![0];
    expect(cred.type).toBe("public-key");
    expect(Array.from(new Uint8Array(cred.id as ArrayBuffer))).toEqual(
      Array.from(credId),
    );
  });

  it("passes rpId, timeout and userVerification through", () => {
    expect(opts.rpId).toBe("localhost");
    expect(opts.timeout).toBe(60000);
    expect(opts.userVerification).toBe("required");
  });

  it("yields an empty allowCredentials when none are supplied", () => {
    const bare = toRequestOptions({ challenge: bytesToB64Url(challenge) });
    expect(bare.allowCredentials).toEqual([]);
  });
});

describe("encodeAssertion — serializes the WebAuthn assertion", () => {
  const clientDataJSON = new Uint8Array([10, 11, 12]);
  const authenticatorData = new Uint8Array([20, 21]);
  const signature = new Uint8Array([30, 31, 32, 33]);
  const rawId = new Uint8Array([40, 41]);

  function fakeCredential(userHandle: Uint8Array | null): PublicKeyCredential {
    return {
      id: "cred-abc",
      type: "public-key",
      rawId: rawId.buffer,
      response: {
        clientDataJSON: clientDataJSON.buffer,
        authenticatorData: authenticatorData.buffer,
        signature: signature.buffer,
        userHandle: userHandle ? userHandle.buffer : null,
      },
      getClientExtensionResults: () => ({}),
    } as unknown as PublicKeyCredential;
  }

  it("base64url-encodes every binary field", () => {
    const out = encodeAssertion(fakeCredential(new Uint8Array([50, 51])));
    expect(out.id).toBe("cred-abc");
    expect(out.type).toBe("public-key");
    expect(out.rawId).toBe(bytesToB64Url(rawId));
    expect(out.response.clientDataJSON).toBe(bytesToB64Url(clientDataJSON));
    expect(out.response.authenticatorData).toBe(
      bytesToB64Url(authenticatorData),
    );
    expect(out.response.signature).toBe(bytesToB64Url(signature));
    expect(out.response.userHandle).toBe(
      bytesToB64Url(new Uint8Array([50, 51])),
    );
  });

  it("emits a null userHandle when the authenticator omits it", () => {
    const out = encodeAssertion(fakeCredential(null));
    expect(out.response.userHandle).toBeNull();
  });
});
