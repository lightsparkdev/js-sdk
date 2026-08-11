// PASSKEY lifecycle: create (real registration), challenge, verify (assertion),
// add (signed retry, session-stamped in production).
//
// DOM-free operation functions. Attestation / assertion material is passed in
// as plain values (the React layer captures it from the real WebAuthn ceremony
// in production, or the seeded magic values in sandbox); this module talks to
// Grid + Turnkey and emits log events through the injected `Reporter`.

import { SANDBOX_SIG, type Mode } from "../config";
import { apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { generateClientKeyPair, turnkeyStamp } from "../turnkey";
import { setSessionKeysFromVerify } from "../session";
import { rememberRawCredentialId } from "../passkey-store";
import {
  createRealPasskey,
  signWithPasskey,
  type RealAssertion,
} from "../webauthn";
import { setCtxCredential, setCtxSession } from "./context";

export interface PasskeyAttestation {
  challenge: string;
  credentialId: string;
  clientDataJson: string;
  attestationObject: string;
}

export interface PasskeyAssertion {
  credentialId: string;
  clientDataJson: string;
  authenticatorData: string;
  signature: string;
}

// ----- Create / Add a credential (attestation) -----

function buildCredentialBody(
  accountId: string,
  nickname: string,
  attestation: PasskeyAttestation,
): Record<string, unknown> {
  return {
    type: "PASSKEY",
    accountId,
    nickname,
    challenge: attestation.challenge,
    attestation: {
      credentialId: attestation.credentialId,
      clientDataJson: attestation.clientDataJson,
      attestationObject: attestation.attestationObject,
    },
  };
}

export async function createPasskeyCredential(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  nickname: string,
  attestation: PasskeyAttestation,
): Promise<unknown> {
  const body = buildCredentialBody(accountId, nickname, attestation);
  const { data } = await apiPost(auth, "/auth/credentials", body);
  reporter.log({ level: "response", label: "PASSKEY Create", detail: data });
  const d = data as Record<string, unknown>;
  if (d.id) {
    setCtxCredential(d.id as string);
    // Map the new Grid credential id → the raw WebAuthn credential id so a later
    // sign-in can target this security key via allowCredentials.
    rememberRawCredentialId(d.id as string, attestation.credentialId);
  }
  return data;
}

// Drive a real WebAuthn registration on a roaming security key (YubiKey) and
// return the attestation the Create / Add flows send.
export async function registerRealPasskey(
  reporter: Reporter,
  nickname: string,
  rpId?: string,
): Promise<PasskeyAttestation> {
  const att = await createRealPasskey(nickname, rpId);
  reporter.log({
    level: "info",
    label: "Passkey Registered (real)",
    detail: att,
  });
  return att;
}

// ----- Session challenge + verify -----

export interface PasskeyChallengeResult {
  data: unknown;
  requestId: string | undefined;
  challenge: string;
}

export async function requestPasskeyChallenge(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  clientPublicKey: string,
): Promise<PasskeyChallengeResult> {
  if (!clientPublicKey.trim())
    throw new Error("Client public key is required — generate one first.");
  const { data } = await apiPost(
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/challenge`,
    { clientPublicKey: clientPublicKey.trim() },
  );
  reporter.log({ level: "response", label: "PASSKEY Challenge", detail: data });
  const d = data as Record<string, unknown>;
  const requestId = typeof d.requestId === "string" ? d.requestId : undefined;
  const challenge = typeof d.challenge === "string" ? d.challenge : "";
  return { data, requestId, challenge };
}

// Run /verify with the supplied assertion, adopting whichever session signing
// key the response carries. Shared by guided login + the manual verify path.
export async function runPasskeyVerify(
  reporter: Reporter,
  auth: ApiAuth,
  credId: string,
  clientPublicKey: string,
  assertion: PasskeyAssertion,
  requestId: string | undefined,
): Promise<unknown> {
  const body = {
    type: "PASSKEY",
    clientPublicKey: clientPublicKey.trim(),
    assertion: {
      credentialId: assertion.credentialId.trim(),
      clientDataJson: assertion.clientDataJson.trim(),
      authenticatorData: assertion.authenticatorData.trim(),
      signature: assertion.signature.trim(),
    },
  };
  const headers: Record<string, string> = {};
  if (requestId) headers["Request-Id"] = requestId;
  const { data } = await apiPost(
    auth,
    `/auth/credentials/${encodeURIComponent(credId)}/verify`,
    body,
    headers,
  );
  reporter.log({ level: "response", label: "PASSKEY Verify", detail: data });
  const d = data as Record<string, unknown>;
  if (d.id) setCtxSession(d.id as string);
  // Legacy CREATE_READ_WRITE_SESSION returns the bundle; STAMP_LOGIN (the
  // login-family knob ON) returns a session JWT only and the client keypair
  // behind `body.clientPublicKey` is the session key. Pass the key exactly as
  // sent so the cached session key is the one Turnkey registered.
  setSessionKeysFromVerify(d.encryptedSessionSigningKey, body.clientPublicKey);
  return data;
}

export interface PasskeyLoginParams {
  credId: string;
  mode: Mode;
  /**
   * Raw WebAuthn credential id(s) for the assertion's allowCredentials
   * (production). Pass every registered passkey's raw id so the security key
   * can satisfy the assertion; empty/omitted falls back to a discoverable
   * credential on the key.
   */
  credentialIds?: string[];
  rpId?: string;
  /** Sandbox-seeded assertion fields, used when not running a real ceremony. */
  sandboxAssertion?: PasskeyAssertion;
}

export interface PasskeyLoginResult {
  data: unknown;
  clientPublicKey: string;
  assertion: PasskeyAssertion;
}

// Drive a real WebAuthn assertion against the issued challenge, targeting the
// security key via the supplied raw credential id(s).
export async function signRealPasskey(
  reporter: Reporter,
  challenge: string,
  credentialIds: string[],
  rpId?: string,
): Promise<RealAssertion> {
  const assertion = await signWithPasskey(challenge, credentialIds, rpId);
  reporter.log({
    level: "info",
    label: "Passkey Signed (real)",
    detail: assertion,
  });
  return assertion;
}

// Guided log in: gen client key → /challenge → assertion (a real security-key
// ceremony in production, the seeded sandbox assertion otherwise) → /verify.
export async function loginPasskey(
  reporter: Reporter,
  auth: ApiAuth,
  params: PasskeyLoginParams,
): Promise<PasskeyLoginResult> {
  const kp = generateClientKeyPair();
  const { requestId, challenge } = await requestPasskeyChallenge(
    reporter,
    auth,
    params.credId,
    kp.publicKeyUncompressed,
  );

  let assertion: PasskeyAssertion;
  if (params.mode === "production") {
    const real = await signRealPasskey(
      reporter,
      challenge,
      params.credentialIds ?? [],
      params.rpId,
    );
    assertion = {
      credentialId: real.credentialId,
      clientDataJson: real.clientDataJson,
      authenticatorData: real.authenticatorData,
      signature: real.signature,
    };
  } else {
    if (!params.sandboxAssertion)
      throw new Error("Sandbox assertion fields are required.");
    assertion = params.sandboxAssertion;
  }

  const data = await runPasskeyVerify(
    reporter,
    auth,
    params.credId,
    kp.publicKeyUncompressed,
    assertion,
    requestId,
  );
  return { data, clientPublicKey: kp.publicKeyUncompressed, assertion };
}

// ----- Sign-in entry point (create-vs-authenticate) -----
//
// Mirror of EMAIL_OTP's signIn: only register (create) a PASSKEY credential when
// the wallet doesn't already have one. When `existingCredId` is provided we run
// the challenge → assertion → verify ceremony directly against it (no create);
// otherwise we register a new passkey first, then verify it into a session.
//
// `register` produces the attestation for the create leg (a real Touch ID
// ceremony in production, the seeded magic attestation in sandbox). It is only
// invoked when there is no existing credential, so callers don't pay for a
// registration prompt on an authenticate-with-existing sign-in.
export interface PasskeySignInParams {
  accountId: string;
  nickname: string;
  existingCredId: string | null;
  /** Login params reused for the verify ceremony (mode, rpId, sandbox seed, and
   *  the raw `credentialIds` for the assertion). `credId` is filled in by
   *  signInPasskey once the credential to use is known. */
  loginParams: Omit<PasskeyLoginParams, "credId">;
  /** Produce the attestation for the create leg. Only called when registering a
   *  new credential (no existing one). */
  register: () => Promise<PasskeyAttestation>;
}

export async function signInPasskey(
  reporter: Reporter,
  auth: ApiAuth,
  params: PasskeySignInParams,
): Promise<unknown> {
  let credId = params.existingCredId;
  // When we register a fresh passkey, its raw WebAuthn credential id is only
  // known here — feed it into the assertion's allowCredentials so the verify
  // leg targets the security key we just created on.
  let freshRawId: string | undefined;
  if (!credId) {
    const attestation = await params.register();
    freshRawId = attestation.credentialId;
    const cred = await createPasskeyCredential(
      reporter,
      auth,
      params.accountId,
      params.nickname,
      attestation,
    );
    credId = (cred as { id?: string }).id ?? null;
    if (!credId) throw new Error("Create credential returned no id.");
  }
  const credentialIds = [
    ...(params.loginParams.credentialIds ?? []),
    ...(freshRawId ? [freshRawId] : []),
  ];
  const { data } = await loginPasskey(reporter, auth, {
    ...params.loginParams,
    credentialIds,
    credId,
  });
  return data;
}

// ----- Add an additional passkey (issue → signed retry) -----

export interface PasskeyAddIssueResult {
  data: unknown;
  requestId: string | undefined;
  payloadToSign: string | undefined;
}

export async function addPasskeyIssue(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  nickname: string,
  attestation: PasskeyAttestation,
): Promise<PasskeyAddIssueResult> {
  const body = buildCredentialBody(accountId, nickname, attestation);
  const { data } = await apiPost(auth, "/auth/credentials", body);
  reporter.log({
    level: "response",
    label: "PASSKEY Add (issue)",
    detail: data,
  });
  const d = data as Record<string, unknown>;
  const requestId = typeof d.requestId === "string" ? d.requestId : undefined;
  const payloadToSign =
    typeof d.payloadToSign === "string" ? d.payloadToSign : undefined;
  return { data, requestId, payloadToSign };
}

export async function addPasskeyRetry(
  reporter: Reporter,
  auth: ApiAuth,
  accountId: string,
  nickname: string,
  attestation: PasskeyAttestation,
  requestId: string,
  payloadToSign: string | undefined,
): Promise<unknown> {
  if (!requestId.trim())
    throw new Error("Request-Id is required — run the issue step first.");
  // Sandbox accepts the magic value, but real Turnkey requires the
  // CREATE_AUTHENTICATORS payload to be stamped by an authorized credential —
  // the active session's signing key. Establish a session (e.g. OTP login or
  // passkey verify) first so the session signing key is available.
  let signature = SANDBOX_SIG;
  if (auth.mode === "production") {
    if (!payloadToSign)
      throw new Error("Missing payloadToSign — run the issue step first.");
    signature = await turnkeyStamp(payloadToSign);
  }
  const { data } = await apiPost(
    auth,
    "/auth/credentials",
    buildCredentialBody(accountId, nickname, attestation),
    { "Grid-Wallet-Signature": signature, "Request-Id": requestId.trim() },
  );
  reporter.log({
    level: "response",
    label: "PASSKEY Add (retry)",
    detail: data,
  });
  // Map the added Grid credential id → its raw WebAuthn credential id so a later
  // sign-in can target this additional security key via allowCredentials.
  const addedId = (data as Record<string, unknown>)?.id;
  if (typeof addedId === "string" && addedId)
    rememberRawCredentialId(addedId, attestation.credentialId);
  return data;
}
