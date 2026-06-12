// WebAuthn ceremony helpers (real passkeys).
//
// The sandbox flows accept magic placeholder strings, but a real Turnkey
// sub-org needs a genuine WebAuthn credential. These helpers drive the
// browser's authenticator and base64url-encode the results into the same
// fields the sandbox flow uses, so Create / Add / Verify work unchanged
// against production Turnkey.
//
// AUTHENTICATOR: we target a ROAMING security key (e.g. a YubiKey), not the
// platform authenticator (Touch ID / Windows Hello). Registration asks the
// browser for a cross-platform authenticator; authentication targets the
// registered credential id(s) over USB / NFC. This keeps the wallet's signing
// key on a removable hardware key rather than the laptop's secure enclave.
//
// NOTE: WebAuthn binds a credential to an RP ID that must be a suffix of the
// page origin — on localhost that means rpId="localhost". The Turnkey sub-org
// must have been created with the SAME RP ID or verification will fail.

// COSE algorithm identifiers we accept for the credential public key. ES256
// (-7) is universally supported by security keys; RS256 (-257) is a fallback.
const PUB_KEY_CRED_PARAMS: PublicKeyCredentialParameters[] = [
  { type: "public-key", alg: -7 }, // ES256
  { type: "public-key", alg: -257 }, // RS256
];

// Transports a roaming security key (YubiKey) is reached over. Listed in the
// assertion's allowCredentials so the browser steers the user to the security
// key rather than offering a platform passkey.
export const SECURITY_KEY_TRANSPORTS: AuthenticatorTransport[] = ["usb", "nfc"];

export function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64UrlToBytes(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Resolve the WebAuthn RP ID: a caller-supplied value (the passkey-rp-id form
// field, in the UI), falling back to the page hostname. Must be a suffix of the
// page origin and match the RP ID the Turnkey sub-org was created with.
export function passkeyRpId(rpId?: string): string {
  return rpId?.trim() || location.hostname;
}

export interface RealAttestation {
  challenge: string;
  credentialId: string;
  clientDataJson: string;
  attestationObject: string;
}

/**
 * Build the `PublicKeyCredentialCreationOptions` for a registration ceremony
 * that targets a ROAMING SECURITY KEY (YubiKey):
 *   - `authenticatorAttachment: "cross-platform"` makes the browser prompt for
 *     a removable security key (USB / NFC), NOT the platform authenticator.
 *   - `residentKey: "discouraged"` + `requireResidentKey: false`: the key need
 *     not store a discoverable credential — we always have its id to put in
 *     `allowCredentials`, which lets cheaper non-resident keys work and avoids
 *     burning the key's limited resident-credential slots.
 *   - `userVerification: "preferred"`: use the PIN/biometric if the key has one,
 *     but don't hard-require it (a basic touch-only key still works).
 *   - `pubKeyCredParams` includes ES256 (-7), which every security key supports.
 *
 * Pure (no DOM / crypto side effects) so it can be unit-tested; the caller
 * supplies the random challenge + user id.
 */
export function buildCreationOptions(
  nickname: string,
  rpId: string | undefined,
  challenge: BufferSource,
  userId: BufferSource,
): PublicKeyCredentialCreationOptions {
  return {
    rp: { id: passkeyRpId(rpId), name: "Grid Example App" },
    user: {
      id: userId,
      name: nickname || "grid-example-user",
      displayName: nickname || "Grid Example User",
    },
    challenge,
    pubKeyCredParams: PUB_KEY_CRED_PARAMS,
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      residentKey: "discouraged",
      requireResidentKey: false,
      userVerification: "preferred",
    },
    attestation: "none",
    timeout: 60000,
  };
}

// Real registration ceremony — produces the attestation that Create/Add send.
// `attestation.credentialId` is the RAW WebAuthn credential id (base64url): the
// caller should persist it so a later assertion can target this security key
// via allowCredentials. (The Grid credential id returned by POST
// /auth/credentials is a DIFFERENT, server-side id — not usable here.)
export async function createRealPasskey(
  nickname: string,
  rpId?: string,
): Promise<RealAttestation> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = (await navigator.credentials.create({
    publicKey: buildCreationOptions(nickname, rpId, challenge, userId),
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey creation returned no credential");
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    challenge: bytesToB64Url(challenge),
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    attestationObject: bytesToB64Url(
      new Uint8Array(response.attestationObject),
    ),
  };
}

export interface RealAssertion {
  credentialId: string;
  authenticatorData: string;
  clientDataJson: string;
  signature: string;
}

/**
 * Build `allowCredentials` from the registered passkeys' RAW WebAuthn credential
 * ids (base64url). Each entry carries `transports: ["usb","nfc"]` so the browser
 * targets the roaming security key. Blank / duplicate ids are dropped.
 *
 * When NO ids are known (e.g. a credential registered before we started storing
 * raw ids), this returns `[]` — an empty allowCredentials lets a discoverable
 * (resident) credential on the security key be presented, which is the best we
 * can do without the id. Pure + DOM-free for unit testing.
 */
export function buildAllowCredentials(
  credentialIds: string[],
): PublicKeyCredentialDescriptor[] {
  const seen = new Set<string>();
  const out: PublicKeyCredentialDescriptor[] = [];
  for (const id of credentialIds) {
    const trimmed = id?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push({
      type: "public-key",
      id: b64UrlToBytes(trimmed) as BufferSource,
      transports: SECURITY_KEY_TRANSPORTS,
    });
  }
  return out;
}

/**
 * Build the `PublicKeyCredentialRequestOptions` for an assertion that targets a
 * roaming security key. Pure (no DOM); the caller encodes the challenge bytes.
 */
export function buildAssertionOptions(
  challenge: BufferSource,
  credentialIds: string[],
  rpId?: string,
): PublicKeyCredentialRequestOptions {
  return {
    rpId: passkeyRpId(rpId),
    challenge,
    allowCredentials: buildAllowCredentials(credentialIds),
    userVerification: "preferred",
    timeout: 60000,
  };
}

// Real assertion ceremony — signs the issued session challenge with the security
// key. `credentialIds` are the RAW WebAuthn credential ids (base64url) of the
// registered passkey(s); pass every one a wallet has so the key can match any.
export async function signWithPasskey(
  challengeValue: string,
  credentialIds: string | string[],
  rpId?: string,
): Promise<RealAssertion> {
  if (!challengeValue) {
    throw new Error(
      "No challenge — issue a session challenge (step above) first.",
    );
  }
  // Turnkey's WebAuthn challenge is the UTF-8 bytes of the sha256-hex challenge
  // string returned by /challenge — NOT base64url-decoded.
  const challenge = new TextEncoder().encode(challengeValue);
  const ids = Array.isArray(credentialIds)
    ? credentialIds
    : credentialIds
    ? [credentialIds]
    : [];
  const credential = (await navigator.credentials.get({
    publicKey: buildAssertionOptions(challenge, ids, rpId),
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey assertion returned no credential");
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    authenticatorData: bytesToB64Url(
      new Uint8Array(response.authenticatorData),
    ),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    signature: bytesToB64Url(new Uint8Array(response.signature)),
  };
}
