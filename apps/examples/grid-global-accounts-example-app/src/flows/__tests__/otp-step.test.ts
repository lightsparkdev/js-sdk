import { describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import { sendOtpChallenge, verifyOtpStep, type OtpStepDeps } from "../otp-step";

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "sandbox",
};

function makeDeps() {
  const requestChallenge = vi.fn().mockResolvedValue("bundle-from-challenge");
  const runVerify = vi
    .fn()
    .mockResolvedValue({ leg1: {}, session: { id: "sess-1" } });
  const deps = { requestChallenge, runVerify } as unknown as OtpStepDeps;
  return { requestChallenge, runVerify, deps };
}

describe("EMAIL_OTP two-step sign-in (challenge decoupled from verify)", () => {
  it("sendOtpChallenge fires the challenge exactly once and returns the bundle", async () => {
    const { reporter } = createCollectingReporter();
    const { requestChallenge, runVerify, deps } = makeDeps();

    const next = await sendOtpChallenge(reporter, auth, "otp-cred", deps);

    expect(requestChallenge).toHaveBeenCalledOnce();
    expect(requestChallenge).toHaveBeenCalledWith(reporter, auth, "otp-cred");
    expect(next).toEqual({
      status: "awaiting_code",
      targetBundle: "bundle-from-challenge",
    });
    // Sending the challenge must not verify anything.
    expect(runVerify).not.toHaveBeenCalled();
  });

  it("verifyOtpStep never issues a challenge — it only runs verify against the cached bundle", async () => {
    const { reporter } = createCollectingReporter();
    const { requestChallenge, runVerify, deps } = makeDeps();

    const session = await verifyOtpStep(
      reporter,
      auth,
      "otp-cred",
      "bundle-from-challenge",
      "000000",
      deps,
    );

    expect(requestChallenge).not.toHaveBeenCalled();
    expect(runVerify).toHaveBeenCalledOnce();
    expect(runVerify).toHaveBeenCalledWith(
      reporter,
      auth,
      "otp-cred",
      "bundle-from-challenge",
      "000000",
    );
    expect(session).toEqual({ id: "sess-1" });
  });

  it("a full send → verify only sends ONE OTP; a verify retry sends none", async () => {
    const { reporter } = createCollectingReporter();
    const { requestChallenge, runVerify, deps } = makeDeps();

    // Step 1: explicit Send.
    const step = await sendOtpChallenge(reporter, auth, "otp-cred", deps);
    // Step 2: verify with the bundle from step 1 — a first attempt that fails…
    runVerify.mockRejectedValueOnce(new Error("bad code"));
    await expect(
      verifyOtpStep(
        reporter,
        auth,
        "otp-cred",
        step.targetBundle,
        "wrong",
        deps,
      ),
    ).rejects.toThrow(/bad code/);
    // …then a retry with the SAME bundle succeeds — still no extra challenge.
    const session = await verifyOtpStep(
      reporter,
      auth,
      "otp-cred",
      step.targetBundle,
      "000000",
      deps,
    );

    // Exactly one OTP was sent across the whole interaction.
    expect(requestChallenge).toHaveBeenCalledOnce();
    expect(runVerify).toHaveBeenCalledTimes(2);
    expect(session).toEqual({ id: "sess-1" });
  });

  it("verifyOtpStep refuses to verify without a challenge bundle", async () => {
    const { reporter } = createCollectingReporter();
    const { requestChallenge, runVerify, deps } = makeDeps();

    await expect(
      verifyOtpStep(reporter, auth, "otp-cred", "", "000000", deps),
    ).rejects.toThrow(/send the code first/i);
    expect(requestChallenge).not.toHaveBeenCalled();
    expect(runVerify).not.toHaveBeenCalled();
  });

  it("verifyOtpStep requires a code (does not verify an empty OTP)", async () => {
    const { reporter } = createCollectingReporter();
    const { runVerify, deps } = makeDeps();

    await expect(
      verifyOtpStep(reporter, auth, "otp-cred", "bundle", "   ", deps),
    ).rejects.toThrow(/one-time code/i);
    expect(runVerify).not.toHaveBeenCalled();
  });

  it("Resend is just another explicit challenge — one call per click", async () => {
    const { reporter } = createCollectingReporter();
    const { requestChallenge, deps } = makeDeps();

    await sendOtpChallenge(reporter, auth, "otp-cred", deps); // initial Send
    await sendOtpChallenge(reporter, auth, "otp-cred", deps); // Resend click

    expect(requestChallenge).toHaveBeenCalledTimes(2);
  });
});
