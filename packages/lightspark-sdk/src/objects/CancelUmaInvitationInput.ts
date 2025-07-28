// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CancelUmaInvitationInput {
  inviteCode: string;
}

export const CancelUmaInvitationInputFromJson = (
  obj: any,
): CancelUmaInvitationInput => {
  return {
    inviteCode: obj["cancel_uma_invitation_input_invite_code"],
  } as CancelUmaInvitationInput;
};
export const CancelUmaInvitationInputToJson = (
  obj: CancelUmaInvitationInput,
): any => {
  return {
    cancel_uma_invitation_input_invite_code: obj.inviteCode,
  };
};

export default CancelUmaInvitationInput;
