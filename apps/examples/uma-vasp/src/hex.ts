export const hexToBytes = (hex: string): Uint8Array => {
  const buffer = Buffer.from(hex, "hex");
  return new Uint8Array(buffer);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
