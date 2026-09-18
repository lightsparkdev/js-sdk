// Google Identity Services (GIS): a browser id_token flow — public client, no
// secret. Companion browser-only module to `webauthn.ts`.

const GIS_SRC = "https://accounts.google.com/gsi/client";

interface CredentialResponse {
  credential?: string;
}

interface PromptMomentNotification {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  getNotDisplayedReason?: () => string;
  getSkippedReason?: () => string;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce?: string;
    auto_select?: boolean;
  }): void;
  prompt(listener?: (notification: PromptMomentNotification) => void): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

// The nonce Turnkey's enclave requires: sha256 of the public-key hex STRING the
// client sends as `clientPublicKey`, lowercase hex. Hashing that exact string
// keeps the nonce and the sent key bound so the enclave accepts the token.
export async function oidcNonceForPublicKey(
  publicKeyHex: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(publicKeyHex),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let gisPromise: Promise<GoogleIdApi> | null = null;

function loadGoogleIdentityServices(): Promise<GoogleIdApi> {
  const existing = window.google?.accounts?.id;
  if (existing) return Promise.resolve(existing);
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<GoogleIdApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error("Google Identity Services loaded without an API."));
    };
    script.onerror = () => {
      gisPromise = null;
      reject(new Error("Failed to load Google Identity Services."));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

// Run the GIS One Tap prompt; resolve with the returned OIDC id_token. `nonce`
// is set only for login (verify binds it to the session key); the add flow
// registers the provider from iss/aud and passes no nonce.
export async function requestGoogleIdToken(
  clientId: string,
  nonce?: string,
): Promise<string> {
  if (!clientId.trim())
    throw new Error(
      "Google client ID is not configured — set VITE_GOOGLE_CLIENT_ID.",
    );
  const gid = await loadGoogleIdentityServices();
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };
    gid.initialize({
      client_id: clientId,
      nonce,
      callback: (response) =>
        finish(() =>
          response.credential
            ? resolve(response.credential)
            : reject(new Error("Google sign-in returned no credential.")),
        ),
    });
    gid.prompt((notification) => {
      if (notification.isNotDisplayed?.())
        finish(() =>
          reject(
            new Error(
              `Google sign-in wasn't shown (${
                notification.getNotDisplayedReason?.() ?? "unknown reason"
              }).`,
            ),
          ),
        );
      else if (notification.isSkippedMoment?.())
        finish(() =>
          reject(
            new Error(
              `Google sign-in was dismissed (${
                notification.getSkippedReason?.() ?? "unknown reason"
              }).`,
            ),
          ),
        );
    });
  });
}
