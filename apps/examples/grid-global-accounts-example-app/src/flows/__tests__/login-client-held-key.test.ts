import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import { runOauthVerify } from "../oauth";
import { runPasskeyVerify, type PasskeyAssertion } from "../passkey";
import {
  getSessionModel,
  hasSessionSigningKey,
  resolveSessionKeys,
  setActiveSessionAccount,
} from "../../session";
import { generateClientKeyPair } from "../../turnkey";

// Mock only the HTTP boundary: the point of these tests is which session model
// the flow adopts from a real response shape, using real client keypairs.
vi.mock("../../api-client", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));
import { apiPost } from "../../api-client";
const mockPost = vi.mocked(apiPost);

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "sandbox",
};

const assertion: PasskeyAssertion = {
  credentialId: "raw-cred-id",
  clientDataJson: "client-data",
  authenticatorData: "auth-data",
  signature: "sig",
};

// A verify response as Grid returns it; `encryptedSessionSigningKey` is present
// only under the legacy (knob-OFF) session model.
function verifyResponse(bundle?: string): { status: number; data: unknown } {
  const data: Record<string, unknown> = { id: "Session:1" };
  if (bundle) data.encryptedSessionSigningKey = bundle;
  return { status: 200, data };
}

beforeEach(() => {
  mockPost.mockReset();
  setActiveSessionAccount("InternalAccount:login");
});

afterEach(() => {
  setActiveSessionAccount(null);
});

describe("passkey/oauth verify adapts to either login session model", () => {
  it("caches the bundle when PASSKEY verify returns encryptedSessionSigningKey", async () => {
    const { reporter } = createCollectingReporter();
    const kp = generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse("bundle-from-verify"));

    await runPasskeyVerify(
      reporter,
      auth,
      "cred-1",
      kp.publicKey,
      assertion,
      "req-1",
    );

    // Legacy model: the key is derivable (bundle + client keypair), not cached.
    expect(getSessionModel()).toBe("verify-bundle");
    expect(hasSessionSigningKey()).toBe(true);
  });

  it("adopts the client keypair as the session key when PASSKEY verify omits the bundle", async () => {
    const { reporter } = createCollectingReporter();
    const kp = generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse());

    await runPasskeyVerify(
      reporter,
      auth,
      "cred-1",
      kp.publicKey,
      assertion,
      "req-1",
    );

    // Client-held key: the compressed key we sent is what Turnkey registered,
    // so that is what later stamps must present.
    expect(getSessionModel()).toBe("otp-tek");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: kp.publicKey,
      apiPrivateKey: kp.privateKey,
    });
  });

  it("caches the bundle when OAUTH verify returns encryptedSessionSigningKey", async () => {
    const { reporter } = createCollectingReporter();
    const kp = generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse("bundle-from-verify"));

    await runOauthVerify(reporter, auth, "cred-2", "oidc-token", kp.publicKey);

    expect(getSessionModel()).toBe("verify-bundle");
    expect(hasSessionSigningKey()).toBe(true);
  });

  it("adopts the client keypair as the session key when OAUTH verify omits the bundle", async () => {
    const { reporter } = createCollectingReporter();
    const kp = generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse());

    await runOauthVerify(reporter, auth, "cred-2", "oidc-token", kp.publicKey);

    expect(getSessionModel()).toBe("otp-tek");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: kp.publicKey,
      apiPrivateKey: kp.privateKey,
    });
  });

  it("adopts the uncompressed (legacy) key when a bundle-less verify sent it", async () => {
    const { reporter } = createCollectingReporter();
    const kp = generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse());

    // The legacy toggle sends the uncompressed key; a bundle-less verify still
    // adopts it, cached in the exact encoding that was sent.
    await runOauthVerify(
      reporter,
      auth,
      "cred-2",
      "oidc-token",
      kp.publicKeyUncompressed,
    );

    expect(getSessionModel()).toBe("otp-tek");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: kp.publicKeyUncompressed,
      apiPrivateKey: kp.privateKey,
    });
  });

  it("leaves the session keyless when a bundle-less verify used a foreign client key", async () => {
    const { reporter } = createCollectingReporter();
    generateClientKeyPair();
    mockPost.mockResolvedValue(verifyResponse());

    // A key this client never generated cannot be the session key — adopting the
    // held keypair anyway would cache a key Turnkey never registered.
    await runOauthVerify(reporter, auth, "cred-2", "oidc-token", "04beef");

    expect(getSessionModel()).toBe("none");
    expect(hasSessionSigningKey()).toBe(false);
  });
});
