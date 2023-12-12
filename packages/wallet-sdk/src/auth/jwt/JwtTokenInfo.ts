// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type JwtTokenInfo = {
  accessToken: string;
  validUntil: Date;
};

export function isParsedJwtTokenInfo(value: unknown): value is {
  accessToken: string;
  validUntil: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    typeof value.accessToken === "string" &&
    "validUntil" in value &&
    typeof value.validUntil === "string"
  );
}

export default JwtTokenInfo;
