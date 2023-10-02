import { isBrowser } from "./environment.js";
import { bytesToHex } from "./hex.js";

type SourceData = Uint8Array | string;

export async function createSha256Hash(data: SourceData): Promise<Uint8Array>;
export async function createSha256Hash(
  data: SourceData,
  asHex: true,
): Promise<string>;

export async function createSha256Hash(
  data: SourceData,
  asHex?: boolean,
): Promise<Uint8Array | string> {
  if (isBrowser) {
    const source =
      typeof data === "string" ? new TextEncoder().encode(data) : data;
    const buffer = await window.crypto.subtle.digest("SHA-256", source);
    const arr = new Uint8Array(buffer);
    if (asHex) {
      return bytesToHex(arr);
    }
    return arr;
  } else {
    const { createHash } = await import("crypto");
    if (asHex) {
      const hexStr = createHash("sha256").update(data).digest("hex");
      return hexStr;
    }
    const buffer = createHash("sha256").update(data).digest();
    return new Uint8Array(buffer);
  }
}
