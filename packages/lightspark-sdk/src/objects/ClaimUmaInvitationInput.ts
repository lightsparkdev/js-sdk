// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ClaimUmaInvitationInput {
  invitationCode: string;

  inviteeUma: string;
}

export const ClaimUmaInvitationInputFromJson = (
  obj: any,
): ClaimUmaInvitationInput => {
  return {
    invitationCode: obj["claim_uma_invitation_input_invitation_code"],
    inviteeUma: obj["claim_uma_invitation_input_invitee_uma"],
  } as ClaimUmaInvitationInput;
};
export const ClaimUmaInvitationInputToJson = (
  obj: ClaimUmaInvitationInput,
): any => {
  return {
    claim_uma_invitation_input_invitation_code: obj.invitationCode,
    claim_uma_invitation_input_invitee_uma: obj.inviteeUma,
  };
};

export default ClaimUmaInvitationInput;
