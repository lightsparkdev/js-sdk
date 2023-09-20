// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type IdAndSignature from "./IdAndSignature.js";
import { IdAndSignatureFromJson } from "./IdAndSignature.js";

type SignMessagesInput = {
  signatures: IdAndSignature[];
};

export const SignMessagesInputFromJson = (obj: any): SignMessagesInput => {
  return {
    signatures: obj["sign_messages_input_signatures"].map((e) =>
      IdAndSignatureFromJson(e),
    ),
  } as SignMessagesInput;
};

export default SignMessagesInput;
