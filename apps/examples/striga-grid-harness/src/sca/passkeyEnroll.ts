// WebAuthn passkey enrollment for the Striga SCA factor ceremony — the
// registration counterpart to passkeyLogin's assertion.
//
// factors (type=PASSKEY) returns a standard PublicKeyCredentialCreationOptions
// with its binary fields base64url-encoded (`options`), plus the origins the
// credential may be created against. factors/confirm expects the serialized
// credential under `credential` and the `origin` it was produced against.
//
// The pure converters (toCreationOptions / encodeAttestation) are split out from
// the ceremony so they can be unit-tested without a DOM or a real authenticator.

import { b64UrlToBytes, bytesToB64Url } from "./passkeyLogin";

export interface EnrollPasskeyOptions {
  challenge: string;
  rp?: { id?: string; name?: string };
  user: { id: string; name?: string; displayName?: string };
  pubKeyCredParams?: { type: string; alg: number }[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  excludeCredentials?: { type: string; id: string }[];
}

export interface PasskeyAttestation {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
}

// ES256 then RS256 — the two every platform authenticator supports. Only used
// when the server omits the list, which would otherwise fail the ceremony.
const DEFAULT_PUB_KEY_CRED_PARAMS: PublicKeyCredentialParameters[] = [
  { type: "public-key", alg: -7 },
  { type: "public-key", alg: -257 },
];

// Decode the base64url binary fields the enrollment start carries into the
// ArrayBuffers navigator.credentials.create expects. Pure.
export function toCreationOptions(
  options: EnrollPasskeyOptions,
): PublicKeyCredentialCreationOptions {
  return {
    challenge: b64UrlToBytes(options.challenge),
    rp: { id: options.rp?.id, name: options.rp?.name ?? "Striga" },
    user: {
      id: b64UrlToBytes(options.user.id),
      name: options.user.name ?? "",
      displayName: options.user.displayName ?? options.user.name ?? "",
    },
    pubKeyCredParams: (options.pubKeyCredParams ??
      DEFAULT_PUB_KEY_CRED_PARAMS) as PublicKeyCredentialParameters[],
    timeout: options.timeout,
    attestation: options.attestation,
    authenticatorSelection: options.authenticatorSelection,
    excludeCredentials: (options.excludeCredentials ?? []).map((c) => ({
      type: "public-key",
      id: b64UrlToBytes(c.id),
    })),
  };
}

// Serialize the browser's new credential into the base64url shape
// factors/confirm expects under `credential`. Pure.
export function encodeAttestation(
  credential: PublicKeyCredential,
): PasskeyAttestation {
  const response = credential.response as AuthenticatorAttestationResponse;
  // getTransports is optional in the spec; older authenticators omit it.
  const transports =
    typeof response.getTransports === "function"
      ? response.getTransports()
      : undefined;
  return {
    id: credential.id,
    rawId: bytesToB64Url(new Uint8Array(credential.rawId)),
    type: credential.type,
    response: {
      clientDataJSON: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
      attestationObject: bytesToB64Url(
        new Uint8Array(response.attestationObject),
      ),
      ...(transports?.length ? { transports } : {}),
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

export async function createEnrollmentPasskey(
  options: EnrollPasskeyOptions,
): Promise<PasskeyAttestation> {
  const credential = (await navigator.credentials.create({
    publicKey: toCreationOptions(options),
  })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error(
      "Passkey enrollment was cancelled or returned no credential.",
    );
  }
  return encodeAttestation(credential);
}
