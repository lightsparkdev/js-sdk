// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ClaimUmaInvitationWithIncentivesOutput {
  invitationId: string;
}

export const ClaimUmaInvitationWithIncentivesOutputFromJson = (
  obj: any,
): ClaimUmaInvitationWithIncentivesOutput => {
  return {
    invitationId:
      obj["claim_uma_invitation_with_incentives_output_invitation"].id,
  } as ClaimUmaInvitationWithIncentivesOutput;
};
export const ClaimUmaInvitationWithIncentivesOutputToJson = (
  obj: ClaimUmaInvitationWithIncentivesOutput,
): any => {
  return {
    claim_uma_invitation_with_incentives_output_invitation: {
      id: obj.invitationId,
    },
  };
};

export const FRAGMENT = `
fragment ClaimUmaInvitationWithIncentivesOutputFragment on ClaimUmaInvitationWithIncentivesOutput {
    __typename
    claim_uma_invitation_with_incentives_output_invitation: invitation {
        id
    }
}`;

export default ClaimUmaInvitationWithIncentivesOutput;
