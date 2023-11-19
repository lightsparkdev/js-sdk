// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateUmaInvitationInput {
  inviterUma: string;
}

export const CreateUmaInvitationInputFromJson = (
  obj: any,
): CreateUmaInvitationInput => {
  return {
    inviterUma: obj["create_uma_invitation_input_inviter_uma"],
  } as CreateUmaInvitationInput;
};
export const CreateUmaInvitationInputToJson = (
  obj: CreateUmaInvitationInput,
): any => {
  return {
    create_uma_invitation_input_inviter_uma: obj.inviterUma,
  };
};

export default CreateUmaInvitationInput;
