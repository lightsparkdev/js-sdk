// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";

class LightsparkSigningException extends LightsparkException {
  constructor(message: string, extraInfo?: any) {
    super("SigningException", message, extraInfo);
  }
}

export default LightsparkSigningException;
