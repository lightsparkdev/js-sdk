// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ClaimUmaInvitationOutput {
  invitationId: string;
}

export const ClaimUmaInvitationOutputFromJson = (
  obj: any,
): ClaimUmaInvitationOutput => {
  return {
    invitationId: obj["claim_uma_invitation_output_invitation"].id,
  } as ClaimUmaInvitationOutput;
};
export const ClaimUmaInvitationOutputToJson = (
  obj: ClaimUmaInvitationOutput,
): any => {
  return {
    claim_uma_invitation_output_invitation: { id: obj.invitationId },
  };
};

export const FRAGMENT = `
fragment ClaimUmaInvitationOutputFragment on ClaimUmaInvitationOutput {
    __typename
    claim_uma_invitation_output_invitation: invitation {
        id
    }
}`;

export default ClaimUmaInvitationOutput;
