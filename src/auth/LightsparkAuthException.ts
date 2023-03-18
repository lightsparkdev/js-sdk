import LightsparkException from "../LightsparkException.js";

class LightsparkAuthException extends LightsparkException {
  constructor(message: string, extraInfo?: any) {
    super("AuthException", message, extraInfo);
  }
}

export default LightsparkAuthException;
