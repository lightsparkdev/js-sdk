// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RegionCode from "./RegionCode.js";

interface ClaimUmaInvitationWithIncentivesInput {
  /** The unique code that identifies this invitation and was shared by the inviter. **/
  invitationCode: string;

  /**
   * The UMA of the user claiming the invitation. It will be sent to the inviter so that they can
   * start transacting with the invitee.
   **/
  inviteeUma: string;

  /** The phone hash of the user getting the invitation. **/
  inviteePhoneHash: string;

  /** The region of the user getting the invitation. **/
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
