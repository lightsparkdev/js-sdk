// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ClaimUmaInvitationInput {
  /** The unique code that identifies this invitation and was shared by the inviter. **/
  invitationCode: string;

  /**
   * The UMA of the user claiming the invitation. It will be sent to the inviter so that they can
   * start transacting with the invitee.
   **/
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
