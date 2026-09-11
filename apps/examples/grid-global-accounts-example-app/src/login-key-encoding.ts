// Which SEC1 encoding of the client public key the login flows send. The backend
// routes the login model off it — compressed → modern (client-held key),
// uncompressed → legacy (server HPKE bundle) — so this toggle exercises both
// paths. Persisted in localStorage; default "modern".

import type { ClientKeyPair } from "./session";
import {
  LOGIN_KEY_ENCODING_STORAGE_KEY,
  type LoginKeyEncoding,
} from "./config";

export function readLoginKeyEncoding(): LoginKeyEncoding {
  try {
    return localStorage.getItem(LOGIN_KEY_ENCODING_STORAGE_KEY) === "legacy"
      ? "legacy"
      : "modern";
  } catch {
    return "modern";
  }
}

export function persistLoginKeyEncoding(encoding: LoginKeyEncoding): void {
  try {
    localStorage.setItem(LOGIN_KEY_ENCODING_STORAGE_KEY, encoding);
  } catch {
    // localStorage unavailable (private mode etc.) — non-fatal; the choice just
    // won't survive a reload.
  }
}

export function loginClientPublicKey(kp: ClientKeyPair): string {
  return readLoginKeyEncoding() === "legacy"
    ? kp.publicKeyUncompressed
    : kp.publicKey;
}
