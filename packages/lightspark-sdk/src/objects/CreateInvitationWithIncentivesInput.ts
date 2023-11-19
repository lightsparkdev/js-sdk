// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RegionCode from "./RegionCode.js";

interface CreateInvitationWithIncentivesInput {
  inviterUma: string;

  inviterPhoneHash: string;

  inviterRegion: RegionCode;
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
  };
};

export default CreateInvitationWithIncentivesInput;
