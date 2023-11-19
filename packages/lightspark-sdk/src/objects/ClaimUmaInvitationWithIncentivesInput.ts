// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RegionCode from "./RegionCode.js";

interface ClaimUmaInvitationWithIncentivesInput {
  invitationCode: string;

  inviteeUma: string;

  inviteePhoneHash: string;

  inviteeRegion: RegionCode;
}

export const ClaimUmaInvitationWithIncentivesInputFromJson = (
  obj: any,
): ClaimUmaInvitationWithIncentivesInput => {
  return {
    invitationCode:
      obj["claim_uma_invitation_with_incentives_input_invitation_code"],
    inviteeUma: obj["claim_uma_invitation_with_incentives_input_invitee_uma"],
    inviteePhoneHash:
      obj["claim_uma_invitation_with_incentives_input_invitee_phone_hash"],
    inviteeRegion:
      RegionCode[
        obj["claim_uma_invitation_with_incentives_input_invitee_region"]
      ] ?? RegionCode.FUTURE_VALUE,
  } as ClaimUmaInvitationWithIncentivesInput;
};
export const ClaimUmaInvitationWithIncentivesInputToJson = (
  obj: ClaimUmaInvitationWithIncentivesInput,
): any => {
  return {
    claim_uma_invitation_with_incentives_input_invitation_code:
      obj.invitationCode,
    claim_uma_invitation_with_incentives_input_invitee_uma: obj.inviteeUma,
    claim_uma_invitation_with_incentives_input_invitee_phone_hash:
      obj.inviteePhoneHash,
    claim_uma_invitation_with_incentives_input_invitee_region:
      obj.inviteeRegion,
  };
};

export default ClaimUmaInvitationWithIncentivesInput;
