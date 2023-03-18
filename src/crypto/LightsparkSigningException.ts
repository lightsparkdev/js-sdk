import LightsparkException from "../LightsparkException.js";

class LightsparkSigningException extends LightsparkException {
  constructor(message: string, extraInfo?: any) {
    super("SigningException", message, extraInfo);
  }
}

export default LightsparkSigningException;
