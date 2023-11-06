// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface DeclineToSignMessagesInput {
  /** List of payload ids to decline to sign because validation failed. **/
  payloadIds: string[];
}

export const DeclineToSignMessagesInputFromJson = (
  obj: any,
): DeclineToSignMessagesInput => {
  return {
    payloadIds: obj["decline_to_sign_messages_input_payload_ids"],
  } as DeclineToSignMessagesInput;
};
export const DeclineToSignMessagesInputToJson = (
  obj: DeclineToSignMessagesInput,
): any => {
  return {
    decline_to_sign_messages_input_payload_ids: obj.payloadIds,
  };
};

export default DeclineToSignMessagesInput;
