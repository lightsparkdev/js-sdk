class LightsparkException extends Error {
  code: string;
  message: string;
  extraInfo: any;

  constructor(code: string, message: string, extraInfo?: any) {
    super(message);
    this.code = code;
    this.message = message;
    this.extraInfo = extraInfo;
  }
}

export default LightsparkException;
