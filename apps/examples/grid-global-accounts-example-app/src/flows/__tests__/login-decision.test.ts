import { describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import {
  decideLogin,
  existingCredentialFor,
  parseCredentials,
} from "../login-decision";
import { signInEmailOtp, type EmailOtpSignInDeps } from "../email-otp";

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "production",
};

describe("parseCredentials", () => {
  it("unwraps the { data: [...] } envelope the API returns", () => {
    const raw = { data: [{ id: "c1", type: "EMAIL_OTP" }] };
    expect(parseCredentials(raw)).toEqual([{ id: "c1", type: "EMAIL_OTP" }]);
  });

  it("tolerates a bare array", () => {
    const raw = [{ id: "c1", type: "OAUTH" }];
    expect(parseCredentials(raw)).toEqual([{ id: "c1", type: "OAUTH" }]);
  });

  it("returns [] for a missing/empty payload (loading state)", () => {
    expect(parseCredentials(null)).toEqual([]);
    expect(parseCredentials(undefined)).toEqual([]);
    expect(parseCredentials({})).toEqual([]);
  });
});

describe("existingCredentialFor", () => {
  const creds = [
    { id: "otp-1", type: "EMAIL_OTP" },
    { id: "oauth-1", type: "OAUTH" },
  ];

  it("maps each method to the matching credential type", () => {
    expect(existingCredentialFor(creds, "email_otp")?.id).toBe("otp-1");
    expect(existingCredentialFor(creds, "oauth")?.id).toBe("oauth-1");
    expect(existingCredentialFor(creds, "passkey")).toBeUndefined();
  });

  it("ignores credentials without a usable id", () => {
    const broken = [{ id: "", type: "EMAIL_OTP" }];
    expect(existingCredentialFor(broken, "email_otp")).toBeUndefined();
  });
});

describe("decideLogin", () => {
  it("authenticates with the existing credential id when one exists", () => {
    const creds = [{ id: "otp-1", type: "EMAIL_OTP" }];
    expect(decideLogin(creds, "email_otp")).toEqual({
      action: "authenticate",
      credId: "otp-1",
    });
  });

  it("creates when no credential of that method exists", () => {
    const creds = [{ id: "oauth-1", type: "OAUTH" }];
    expect(decideLogin(creds, "email_otp")).toEqual({ action: "create" });
    expect(decideLogin([], "email_otp")).toEqual({ action: "create" });
  });
});

describe("signInEmailOtp (create-vs-authenticate routing)", () => {
  it("authenticates with the existing credential id and does NOT create", async () => {
    const { reporter } = createCollectingReporter();
    const create = vi.fn();
    const login = vi
      .fn()
      .mockResolvedValue({ leg1: {}, session: { id: "sess-1" } });
    const deps = { create, login } as unknown as EmailOtpSignInDeps;

    const session = await signInEmailOtp(
      reporter,
      auth,
      "acct-1",
      "000000",
      "existing-otp-cred",
      deps,
    );

    expect(create).not.toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith(
      reporter,
      auth,
      "existing-otp-cred",
      "000000",
    );
    expect(session).toEqual({ id: "sess-1" });
  });

  it("creates a credential first when none exists, then logs in with the new id", async () => {
    const { reporter } = createCollectingReporter();
    const create = vi.fn().mockResolvedValue({ id: "new-otp-cred" });
    const login = vi
      .fn()
      .mockResolvedValue({ leg1: {}, session: { id: "sess-2" } });
    const deps = { create, login } as unknown as EmailOtpSignInDeps;

    const session = await signInEmailOtp(
      reporter,
      auth,
      "acct-1",
      "000000",
      null,
      deps,
    );

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(reporter, auth, "acct-1");
    expect(login).toHaveBeenCalledWith(
      reporter,
      auth,
      "new-otp-cred",
      "000000",
    );
    expect(session).toEqual({ id: "sess-2" });
  });

  it("throws if create returns no id (does not silently log in)", async () => {
    const { reporter } = createCollectingReporter();
    const create = vi.fn().mockResolvedValue({});
    const login = vi.fn();
    const deps = { create, login } as unknown as EmailOtpSignInDeps;

    await expect(
      signInEmailOtp(reporter, auth, "acct-1", "000000", null, deps),
    ).rejects.toThrow(/no id/i);
    expect(login).not.toHaveBeenCalled();
  });
});
