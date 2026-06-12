// WebAuthn ceremony helpers (real passkeys).
//
// The sandbox flows accept magic placeholder strings, but a real Turnkey
// sub-org needs a genuine WebAuthn credential. These helpers drive the
// browser's authenticator (Touch ID, etc.) and base64url-encode the results
// into the same fields the sandbox flow uses, so Create / Add / Verify work
// unchanged against production Turnkey.
//
// NOTE: WebAuthn binds a credential to an RP ID that must be a suffix of the
// page origin — on localhost that means rpId="localhost". The Turnkey sub-org
// must have been created with the SAME RP ID or verification will fail.

import { el } from "./ui";

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

export function passkeyRpId(): string {
  return el<HTMLInputElement>("passkey-rp-id").value.trim() || location.hostname;
}

export interface RealAttestation {
  challenge: string;
  credentialId: string;
  clientDataJson: string;
  attestationObject: string;
}

// Real registration ceremony — produces the attestation that Create/Add send.
export async function createRealPasskey(
  nickname: string,
): Promise<RealAttestation> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { id: passkeyRpId(), name: "Grid Example App" },
      user: {
        id: userId,
        name: nickname || "grid-example-user",
        displayName: nickname || "Grid Example User",
      },
      challenge,
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      attestation: "none",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey creation returned no credential");
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    challenge: bytesToB64Url(challenge),
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    attestationObject: bytesToB64Url(new Uint8Array(response.attestationObject)),
  };
}

export interface RealAssertion {
  credentialId: string;
  authenticatorData: string;
  clientDataJson: string;
  signature: string;
}

// Real assertion ceremony — signs the issued session challenge.
export async function signWithPasskey(
  challengeValue: string,
  credentialId: string,
): Promise<RealAssertion> {
  if (!challengeValue) {
    throw new Error(
      "No challenge — issue a session challenge (step above) first.",
    );
  }
  // Turnkey's WebAuthn challenge is the UTF-8 bytes of the sha256-hex challenge
  // string returned by /challenge — NOT base64url-decoded.
  const challenge = new TextEncoder().encode(challengeValue);
  const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
    ? [{ type: "public-key", id: b64UrlToBytes(credentialId) as BufferSource }]
    : [];
  const credential = (await navigator.credentials.get({
    publicKey: {
      rpId: passkeyRpId(),
      challenge,
      allowCredentials,
      userVerification: "preferred",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey assertion returned no credential");
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    credentialId: bytesToB64Url(new Uint8Array(credential.rawId)),
    authenticatorData: bytesToB64Url(new Uint8Array(response.authenticatorData)),
    clientDataJson: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
    signature: bytesToB64Url(new Uint8Array(response.signature)),
  };
}
