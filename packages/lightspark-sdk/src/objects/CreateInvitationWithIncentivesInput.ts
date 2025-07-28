// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RegionCode from "./RegionCode.js";

interface CreateInvitationWithIncentivesInput {
  /**
   * The UMA of the user creating the invitation. It will be used to identify the inviter when
   * receiving the invitation.
   **/
  inviterUma: string;

  /** The phone hash of the user creating the invitation. **/
  inviterPhoneHash: string;

  /** The region of the user creating the invitation. **/
  inviterRegion: RegionCode;

  /** The optional first name of the user creating the invitation. **/
  inviterFirstName?: string | undefined;
}

export const CreateInvitationWithIncentivesInputFromJson = (
  obj: any,
): CreateInvitationWithIncentivesInput => {
  return {
    inviterUma: obj["create_invitation_with_incentives_input_inviter_uma"],
    inviterPhoneHash:
      obj["create_invitation_with_incentives_input_inviter_phone_hash"],
    inviterRegion:
      RegionCode[
        obj["create_invitation_with_incentives_input_inviter_region"]
      ] ?? RegionCode.FUTURE_VALUE,
    inviterFirstName:
      obj["create_invitation_with_incentives_input_inviter_first_name"],
  } as CreateInvitationWithIncentivesInput;
};
export const CreateInvitationWithIncentivesInputToJson = (
  obj: CreateInvitationWithIncentivesInput,
): any => {
  return {
    create_invitation_with_incentives_input_inviter_uma: obj.inviterUma,
    create_invitation_with_incentives_input_inviter_phone_hash:
      obj.inviterPhoneHash,
    create_invitation_with_incentives_input_inviter_region: obj.inviterRegion,
    create_invitation_with_incentives_input_inviter_first_name:
      obj.inviterFirstName,
  };
};

export default CreateInvitationWithIncentivesInput;
