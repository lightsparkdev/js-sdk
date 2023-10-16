export const hexToBytes = (hex: string): Uint8Array => {
  return Buffer.from(hex, "hex");
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
