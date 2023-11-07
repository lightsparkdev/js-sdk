// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type SignablePayload from "./SignablePayload.js";
import {
  SignablePayloadFromJson,
  SignablePayloadToJson,
} from "./SignablePayload.js";

interface DeclineToSignMessagesOutput {
  declinedPayloads: SignablePayload[];
}

export const DeclineToSignMessagesOutputFromJson = (
  obj: any,
): DeclineToSignMessagesOutput => {
  return {
    declinedPayloads: obj[
      "decline_to_sign_messages_output_declined_payloads"
    ].map((e) => SignablePayloadFromJson(e)),
  } as DeclineToSignMessagesOutput;
};
export const DeclineToSignMessagesOutputToJson = (
  obj: DeclineToSignMessagesOutput,
): any => {
  return {
    decline_to_sign_messages_output_declined_payloads: obj.declinedPayloads.map(
      (e) => SignablePayloadToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment DeclineToSignMessagesOutputFragment on DeclineToSignMessagesOutput {
    __typename
    decline_to_sign_messages_output_declined_payloads: declined_payloads {
        id
    }
}`;

export default DeclineToSignMessagesOutput;
