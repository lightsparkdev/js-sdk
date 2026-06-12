// Two-step EMAIL_OTP sign-in orchestration (pure + DOM-free).
//
// The production bug this fixes: the old login coupled the OTP *challenge* (which
// SENDS the email) to *verify* in a single call, so every sign-in attempt — and
// every retry — fired a fresh OTP, invalidating the prior code and tripping the
// rate limit. Here the challenge and verify are two distinct, explicit steps:
//
//   step "idle"          → user must click Send to fire requestV3Challenge ONCE.
//   step "awaiting_code" → the challenge bundle is held; the user enters the code
//                          and clicks Verify, which runs runV3Verify against the
//                          *cached* bundle. Verify NEVER issues a challenge.
//   "Resend" is an explicit re-challenge from the awaiting_code step.
//
// The challenge is injected (`requestChallenge`) and the verify is injected
// (`runVerify`) so the two-step guarantee is unit-testable at the flow boundary
// without exercising real Turnkey: a test can assert the challenge dependency is
// called exactly once per send and that verify is reachable only after a
// challenge, carrying the bundle the challenge produced.

import type { ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import {
  requestV3Challenge,
  runV3Verify,
  type V3VerifyResult,
} from "./email-otp";

/** Where a single credential's OTP sign-in currently is. */
export type OtpStep =
  | { status: "idle" }
  | { status: "challenging" }
  | { status: "awaiting_code"; targetBundle: string }
  | { status: "verifying"; targetBundle: string };

/** The challenge leg: send the OTP for `credId`, returning the enclave bundle. */
export type ChallengeFn = (
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
) => Promise<string>;

/** The verify leg: run the two verify legs against an already-issued bundle. */
export type VerifyFn = (
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  targetBundle: string,
  otp: string,
) => Promise<V3VerifyResult>;

export interface OtpStepDeps {
  requestChallenge: ChallengeFn;
  runVerify: VerifyFn;
}

const defaultOtpStepDeps: OtpStepDeps = {
  requestChallenge: requestV3Challenge,
  runVerify: runV3Verify,
};

/**
 * Fire the challenge for `credId` exactly once and return the bundle-bearing
 * next step. This is the ONLY path that calls the challenge dependency, so the
 * OTP email is sent only when a caller explicitly invokes this (Send / Resend) —
 * never on render and never from `verify`.
 */
export async function sendOtpChallenge(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  deps: OtpStepDeps = defaultOtpStepDeps,
): Promise<Extract<OtpStep, { status: "awaiting_code" }>> {
  const targetBundle = await deps.requestChallenge(reporter, auth, credId);
  return { status: "awaiting_code", targetBundle };
}

/**
 * Verify the entered `otp` against the bundle the challenge already produced.
 * Requires a `targetBundle` from a prior `sendOtpChallenge`; it deliberately
 * does NOT call the challenge dependency, so a verify (or a failed verify retry)
 * can never send a fresh OTP. Returns the auth session on success.
 */
export async function verifyOtpStep(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  targetBundle: string,
  otp: string,
  deps: OtpStepDeps = defaultOtpStepDeps,
): Promise<unknown> {
  if (!targetBundle)
    throw new Error("Send the code first — no challenge bundle to verify.");
  if (!otp.trim()) throw new Error("Enter the one-time code.");
  const { session } = await deps.runVerify(
    reporter,
    auth,
    credId,
    targetBundle,
    otp.trim(),
  );
  return session;
}
