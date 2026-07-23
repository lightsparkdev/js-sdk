// Compute the current 6-digit TOTP from a base32 secret (RFC 6238, SHA-1, 30s).
// The Striga sandbox validates the real algorithmic code for TOTP enrollment —
// unlike SMS, "123456" is rejected — so the harness derives it from the secret
// the enroll-start response returns, making TOTP enrollment one click.

export function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

export async function computeTotp(
  base32Secret: string,
  stepSeconds = 30,
  digits = 6,
  nowMs = Date.now(),
): Promise<string> {
  const key = base32Decode(base32Secret);
  const counter = Math.floor(nowMs / 1000 / stepSeconds);
  const msg = new Uint8Array(8);
  // 64-bit big-endian counter; the low 32 bits carry the value for our range.
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, msg as unknown as ArrayBuffer),
  );
  const offset = sig[sig.length - 1] & 0x0f;
  const bin =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  return String(bin % 10 ** digits).padStart(digits, "0");
}
