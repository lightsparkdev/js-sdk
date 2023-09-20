// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type SignablePayload from "./SignablePayload.js";
import { SignablePayloadFromJson } from "./SignablePayload.js";

type SignMessagesOutput = {
  signedPayloads: SignablePayload[];
};

export const SignMessagesOutputFromJson = (obj: any): SignMessagesOutput => {
  return {
    signedPayloads: obj["sign_messages_output_signed_payloads"].map((e) =>
      SignablePayloadFromJson(e),
    ),
  } as SignMessagesOutput;
};

export const FRAGMENT = `
fragment SignMessagesOutputFragment on SignMessagesOutput {
    __typename
    sign_messages_output_signed_payloads: signed_payloads {
        id
    }
}`;

export default SignMessagesOutput;
