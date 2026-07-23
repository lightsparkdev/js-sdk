// WebAuthn passkey login for the Striga SCA login ceremony.
//
// login/start (factor=PASSKEY) returns a standard PublicKeyCredentialRequestOptions
// with its binary fields base64url-encoded (`options`), plus the origin the
// assertion must be signed for. login/complete expects the serialized assertion
// under `passkeyAssertion` and the `origin` it was produced against.
//
// The pure converters (toRequestOptions / encodeAssertion) are split out from the
// ceremony so they can be unit-tested without a DOM or a real authenticator.

export interface LoginPasskeyOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: { type: string; id: string }[];
  userVerification?: UserVerificationRequirement;
}

export interface PasskeyAssertion {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  };
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
}

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

// Decode the base64url binary fields the login/start response carries into the
// ArrayBuffers navigator.credentials.get expects. Pure.
export function toRequestOptions(
  options: LoginPasskeyOptions,
): PublicKeyCredentialRequestOptions {
  return {
    challenge: b64UrlToBytes(options.challenge),
    timeout: options.timeout,
    rpId: options.rpId,
    userVerification: options.userVerification,
    allowCredentials: (options.allowCredentials ?? []).map((c) => ({
      type: "public-key",
      id: b64UrlToBytes(c.id),
    })),
  };
}

// Serialize the browser's assertion into the base64url shape login/complete
// expects under `passkeyAssertion`. Pure.
export function encodeAssertion(
  credential: PublicKeyCredential,
): PasskeyAssertion {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bytesToB64Url(new Uint8Array(credential.rawId)),
    type: credential.type,
    response: {
      clientDataJSON: bytesToB64Url(new Uint8Array(response.clientDataJSON)),
      authenticatorData: bytesToB64Url(
        new Uint8Array(response.authenticatorData),
      ),
      signature: bytesToB64Url(new Uint8Array(response.signature)),
      userHandle: response.userHandle
        ? bytesToB64Url(new Uint8Array(response.userHandle))
        : null,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

export async function signLoginPasskey(
  options: LoginPasskeyOptions,
): Promise<PasskeyAssertion> {
  const credential = (await navigator.credentials.get({
    publicKey: toRequestOptions(options),
  })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error("Passkey login was cancelled or returned no credential.");
  }
  return encodeAssertion(credential);
}
