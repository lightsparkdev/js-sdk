// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CancelUmaInvitationOutput {
  invitationId: string;
}

export const CancelUmaInvitationOutputFromJson = (
  obj: any,
): CancelUmaInvitationOutput => {
  return {
    invitationId: obj["cancel_uma_invitation_output_invitation"].id,
  } as CancelUmaInvitationOutput;
};
export const CancelUmaInvitationOutputToJson = (
  obj: CancelUmaInvitationOutput,
): any => {
  return {
    cancel_uma_invitation_output_invitation: { id: obj.invitationId },
  };
};

export const FRAGMENT = `
fragment CancelUmaInvitationOutputFragment on CancelUmaInvitationOutput {
    __typename
    cancel_uma_invitation_output_invitation: invitation {
        id
    }
}`;

export default CancelUmaInvitationOutput;
