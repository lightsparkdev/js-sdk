// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import fs from "fs";

export const getPackageVersion = (): string => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as { version: string; [key: string]: string };
  return packageJson?.version;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce((acc: string, byte: number) => {
    return (acc += ("0" + byte.toString(16)).slice(-2));
  }, "");
};

export const hexToBytes = (hex: string): Uint8Array => {
  const bytes: number[] = [];

  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return Uint8Array.from(bytes);
};
