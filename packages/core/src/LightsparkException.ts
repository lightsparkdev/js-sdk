// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

class LightsparkException extends Error {
  code: string;
  message: string;
  extraInfo: Record<string, unknown> | undefined;

  constructor(
    code: string,
    message: string,
    extraInfo?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.extraInfo = extraInfo;
  }
}

export default LightsparkException;
