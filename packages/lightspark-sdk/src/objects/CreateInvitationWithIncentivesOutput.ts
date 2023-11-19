// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateInvitationWithIncentivesOutput {
  invitationId: string;
}

export const CreateInvitationWithIncentivesOutputFromJson = (
  obj: any,
): CreateInvitationWithIncentivesOutput => {
  return {
    invitationId: obj["create_invitation_with_incentives_output_invitation"].id,
  } as CreateInvitationWithIncentivesOutput;
};
export const CreateInvitationWithIncentivesOutputToJson = (
  obj: CreateInvitationWithIncentivesOutput,
): any => {
  return {
    create_invitation_with_incentives_output_invitation: {
      id: obj.invitationId,
    },
  };
};

export const FRAGMENT = `
fragment CreateInvitationWithIncentivesOutputFragment on CreateInvitationWithIncentivesOutput {
    __typename
    create_invitation_with_incentives_output_invitation: invitation {
        id
    }
}`;

export default CreateInvitationWithIncentivesOutput;
