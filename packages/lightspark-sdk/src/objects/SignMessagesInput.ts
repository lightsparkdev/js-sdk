// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type IdAndSignature from "./IdAndSignature.js";
import {
  IdAndSignatureFromJson,
  IdAndSignatureToJson,
} from "./IdAndSignature.js";

interface SignMessagesInput {
  /** The list of the message ids and signatures. **/
  signatures: IdAndSignature[];
}

export const SignMessagesInputFromJson = (obj: any): SignMessagesInput => {
  return {
    signatures: obj["sign_messages_input_signatures"].map((e) =>
      IdAndSignatureFromJson(e),
    ),
  } as SignMessagesInput;
};
export const SignMessagesInputToJson = (obj: SignMessagesInput): any => {
  return {
    sign_messages_input_signatures: obj.signatures.map((e) =>
      IdAndSignatureToJson(e),
    ),
  };
};

export default SignMessagesInput;
