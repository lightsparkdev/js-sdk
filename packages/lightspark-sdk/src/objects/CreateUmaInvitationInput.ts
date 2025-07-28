// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateUmaInvitationInput {
  /**
   * The UMA of the user creating the invitation. It will be used to identify the inviter when
   * receiving the invitation.
   **/
  inviterUma: string;

  /** The optional first name of the user creating the invitation. **/
  inviterFirstName?: string | undefined;
}

export const CreateUmaInvitationInputFromJson = (
  obj: any,
): CreateUmaInvitationInput => {
  return {
    inviterUma: obj["create_uma_invitation_input_inviter_uma"],
    inviterFirstName: obj["create_uma_invitation_input_inviter_first_name"],
  } as CreateUmaInvitationInput;
};
export const CreateUmaInvitationInputToJson = (
  obj: CreateUmaInvitationInput,
): any => {
  return {
    create_uma_invitation_input_inviter_uma: obj.inviterUma,
    create_uma_invitation_input_inviter_first_name: obj.inviterFirstName,
  };
};

export default CreateUmaInvitationInput;
