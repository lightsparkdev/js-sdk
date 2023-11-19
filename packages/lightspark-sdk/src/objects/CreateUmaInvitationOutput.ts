// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateUmaInvitationOutput {
  invitationId: string;
}

export const CreateUmaInvitationOutputFromJson = (
  obj: any,
): CreateUmaInvitationOutput => {
  return {
    invitationId: obj["create_uma_invitation_output_invitation"].id,
  } as CreateUmaInvitationOutput;
};
export const CreateUmaInvitationOutputToJson = (
  obj: CreateUmaInvitationOutput,
): any => {
  return {
    create_uma_invitation_output_invitation: { id: obj.invitationId },
  };
};

export const FRAGMENT = `
fragment CreateUmaInvitationOutputFragment on CreateUmaInvitationOutput {
    __typename
    create_uma_invitation_output_invitation: invitation {
        id
    }
}`;

export default CreateUmaInvitationOutput;
