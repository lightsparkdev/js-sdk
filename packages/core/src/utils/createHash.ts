import { isBrowser } from "./environment.js";

export const createSha256Hash = async (
  data: Uint8Array,
): Promise<Uint8Array> => {
  if (isBrowser) {
    return new Uint8Array(await window.crypto.subtle.digest("SHA-256", data));
  } else {
    const { createHash } = await import("crypto");
    const buffer = createHash("sha256").update(data).digest();
    return new Uint8Array(buffer);
  }
};
