import { afterEach, describe, expect, it } from "vitest";

import {
  clearActiveSession,
  getAccountId,
  getSessionId,
  getSessionModel,
  hasSessionSigningKey,
  resolveSessionKeys,
  setAccountId,
  setActiveSessionAccount,
  setSessionId,
  setSessionKeysFromTek,
} from "../session";

// Reset to logged-out between tests so module-level context state can't leak.
afterEach(() => {
  setActiveSessionAccount(null);
});

describe("per-customer session isolation", () => {
  it("keeps signing keys, model, and account id independent per account key", () => {
    // No active context → logged-out, getters return empty/null.
    setActiveSessionAccount(null);
    expect(hasSessionSigningKey()).toBe(false);
    expect(resolveSessionKeys()).toBeNull();
    expect(getAccountId()).toBe("");
    expect(getSessionModel()).toBe("none");

    // Customer A signs in (OTP-TEK model) under its own account key.
    setActiveSessionAccount("InternalAccount:A");
    setAccountId("InternalAccount:A");
    setSessionKeysFromTek({ publicKey: "pubA", privateKey: "privA" });
    expect(hasSessionSigningKey()).toBe(true);
    expect(getSessionModel()).toBe("otp-tek");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: "pubA",
      apiPrivateKey: "privA",
    });
    expect(getAccountId()).toBe("InternalAccount:A");

    // Switch to a fresh customer B: it inherits NOTHING from A.
    setActiveSessionAccount("InternalAccount:B");
    expect(hasSessionSigningKey()).toBe(false);
    expect(resolveSessionKeys()).toBeNull();
    expect(getSessionModel()).toBe("none");
    expect(getAccountId()).toBe("");

    // B establishes its own session with different keys.
    setAccountId("InternalAccount:B");
    setSessionKeysFromTek({ publicKey: "pubB", privateKey: "privB" });
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: "pubB",
      apiPrivateKey: "privB",
    });
    expect(getAccountId()).toBe("InternalAccount:B");

    // Switching back to A restores A's cached session, untouched by B.
    setActiveSessionAccount("InternalAccount:A");
    expect(hasSessionSigningKey()).toBe(true);
    expect(getSessionModel()).toBe("otp-tek");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: "pubA",
      apiPrivateKey: "privA",
    });
    expect(getAccountId()).toBe("InternalAccount:A");
  });

  it("treats null as logged-out with no active context", () => {
    setActiveSessionAccount("InternalAccount:A");
    setSessionKeysFromTek({ publicKey: "pubA", privateKey: "privA" });
    expect(hasSessionSigningKey()).toBe(true);

    setActiveSessionAccount(null);
    expect(hasSessionSigningKey()).toBe(false);
    expect(resolveSessionKeys()).toBeNull();
    expect(getAccountId()).toBe("");

    // Mutators no-op while logged-out; later re-activation still has A cached.
    setSessionKeysFromTek({ publicKey: "pubX", privateKey: "privX" });
    setActiveSessionAccount("InternalAccount:A");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: "pubA",
      apiPrivateKey: "privA",
    });
  });

  it("clearActiveSession wipes the active context's signing key without touching others", () => {
    // Customer A signs in under its own account key.
    setActiveSessionAccount("InternalAccount:clearA");
    setAccountId("InternalAccount:clearA");
    setSessionId("session-A");
    setSessionKeysFromTek({ publicKey: "pubA", privateKey: "privA" });

    // Customer B signs in under a different key.
    setActiveSessionAccount("InternalAccount:clearB");
    setAccountId("InternalAccount:clearB");
    setSessionId("session-B");
    setSessionKeysFromTek({ publicKey: "pubB", privateKey: "privB" });

    // Back on A, clearing wipes A's signing key/model/session id but keeps the
    // account id so the slot still belongs to A (logged out, can re-auth).
    setActiveSessionAccount("InternalAccount:clearA");
    expect(hasSessionSigningKey()).toBe(true);
    clearActiveSession();
    expect(hasSessionSigningKey()).toBe(false);
    expect(resolveSessionKeys()).toBeNull();
    expect(getSessionModel()).toBe("none");
    expect(getSessionId()).toBe("");
    expect(getAccountId()).toBe("InternalAccount:clearA");

    // B is untouched by clearing A.
    setActiveSessionAccount("InternalAccount:clearB");
    expect(hasSessionSigningKey()).toBe(true);
    expect(getSessionModel()).toBe("otp-tek");
    expect(getSessionId()).toBe("session-B");
    expect(resolveSessionKeys()).toEqual({
      apiPublicKey: "pubB",
      apiPrivateKey: "privB",
    });
  });

  it("clearActiveSession is a no-op when logged out", () => {
    setActiveSessionAccount(null);
    expect(() => clearActiveSession()).not.toThrow();
    expect(hasSessionSigningKey()).toBe(false);
  });

  it("preserves first-account-wins for setAccountId within a fresh context", () => {
    // A distinct key so the context is fresh (contexts persist across tests).
    setActiveSessionAccount("InternalAccount:C");
    setAccountId("first");
    setAccountId("second");
    expect(getAccountId()).toBe("first");
  });
});
