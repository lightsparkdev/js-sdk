// Local map of Grid credential id → raw WebAuthn credential id (base64url).
//
// WebAuthn assertions target a specific security key via `allowCredentials`,
// which needs the RAW credential id the authenticator returned at
// registration. The Grid credential id (from POST /auth/credentials) is a
// DIFFERENT, server-side id and can't be used there. The raw id is only
// available at the moment of `navigator.credentials.create()`, so we persist it
// here keyed by the Grid id when a passkey is registered, and look it up at
// sign-in to drive the assertion against the YubiKey.
//
// LIMITATION: a passkey registered before this store existed (or on another
// device / browser) has no entry — `getRawCredentialId` returns null and the
// assertion falls back to an empty allowCredentials, letting the security key
// present a discoverable credential instead.

const STORAGE_KEY = "grid-example-passkey-raw-ids";

type IdMap = Record<string, string>;

function read(): IdMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as IdMap) : {};
  } catch {
    return {};
  }
}

function write(map: IdMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable (private mode etc.) — non-fatal; the assertion
    // just falls back to a discoverable credential.
  }
}

/** Remember the raw WebAuthn credential id for a freshly-registered passkey. */
export function rememberRawCredentialId(
  gridCredentialId: string,
  rawCredentialId: string,
): void {
  const grid = gridCredentialId?.trim();
  const raw = rawCredentialId?.trim();
  if (!grid || !raw) return;
  const map = read();
  map[grid] = raw;
  write(map);
}

/** The raw WebAuthn credential id for a Grid credential id, or null if unknown. */
export function getRawCredentialId(gridCredentialId: string): string | null {
  const grid = gridCredentialId?.trim();
  if (!grid) return null;
  return read()[grid] ?? null;
}

/** Every raw WebAuthn credential id we've stored (for the given Grid ids, or
 *  all of them). Used to populate `allowCredentials` with all the wallet's
 *  passkeys so any registered security key can satisfy the assertion. */
export function getRawCredentialIds(gridCredentialIds?: string[]): string[] {
  const map = read();
  const grids =
    gridCredentialIds && gridCredentialIds.length > 0
      ? gridCredentialIds
      : Object.keys(map);
  const out: string[] = [];
  for (const grid of grids) {
    const raw = map[grid?.trim()];
    if (raw && !out.includes(raw)) out.push(raw);
  }
  return out;
}
