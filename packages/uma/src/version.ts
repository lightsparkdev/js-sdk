export const MAJOR_VERSION = 0;
export const MINOR_VERSION = 1;

export const UmaProtocolVersion = `${MAJOR_VERSION}.${MINOR_VERSION}`;

export class UnsupportedVersionError extends Error {
  unsupportedVersion: string;
  supportedMajorVersions: number[];

  constructor(unsupportedVersion: string, supportedMajorVersions: number[]) {
    super(`unsupported version: ${unsupportedVersion}`);
    this.unsupportedVersion = unsupportedVersion;
    this.supportedMajorVersions = supportedMajorVersions;
  }
}

export function getHighestSupportedVersionForMajorVersion(
  majorVersion: number,
): string {
  if (majorVersion !== MAJOR_VERSION) {
    throw new Error("unsupported major version");
  }
  return UmaProtocolVersion;
}

export function selectHighestSupportedVersion(
  otherVaspSupportedMajorVersions: number[],
): string {
  let highestVersion: string | undefined;
  const supportedMajorVersions = getSupportedMajorVersions();
  for (const otherVaspMajorVersion of otherVaspSupportedMajorVersions) {
    if (!supportedMajorVersions.has(otherVaspMajorVersion)) {
      continue;
    }

    if (highestVersion === undefined) {
      highestVersion = getHighestSupportedVersionForMajorVersion(
        otherVaspMajorVersion,
      );
      continue;
    }
    if (otherVaspMajorVersion > getMajorVersion(highestVersion)) {
      highestVersion = getHighestSupportedVersionForMajorVersion(
        otherVaspMajorVersion,
      );
    }
  }
  if (highestVersion === undefined) {
    throw new Error("no supported versions");
  }
  return highestVersion;
}

export function selectLowerVersion(
  version1String: string,
  version2String: string,
): string {
  const version1 = parseVersion(version1String);
  const version2 = parseVersion(version2String);
  if (
    version1.major > version2.major ||
    (version1.major === version2.major && version1.minor > version2.minor)
  ) {
    return version2String;
  } else {
    return version1String;
  }
}

export function isVersionSupported(version: string): boolean {
  const parsedVersion = parseVersion(version);
  if (parsedVersion === undefined) {
    return false;
  }
  return getSupportedMajorVersions().has(parsedVersion.major);
}

export function getMajorVersion(version: string): number {
  const parsedVersion = parseVersion(version);
  if (parsedVersion === undefined) {
    throw new Error("invalid version");
  }
  return parsedVersion.major;
}

export function getMinorVersion(version: string): number {
  const parsedVersion = parseVersion(version);
  if (parsedVersion === undefined) {
    throw new Error("invalid version");
  }
  return parsedVersion.minor;
}

export function parseVersion(version: string): {
  major: number;
  minor: number;
} {
  const [major, minor] = version.split(".");
  if (major === undefined || minor === undefined) {
    throw new Error("Invalid UMA version");
  }
  return { major: parseInt(major), minor: parseInt(minor) };
}

export function getSupportedMajorVersions(): Set<number> {
  // NOTE: In the future, we may want to support multiple major versions in the same SDK, but for now, this keeps
  // things simple.
  return new Set([MAJOR_VERSION]);
}
