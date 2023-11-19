// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const ClaimUmaInvitationWithIncentives = `
    mutation ClaimUmaInvitationWithIncentives(
        $invitationCode: String!
        $inviteeUma: String!
        $inviteePhoneHash: String!
        $inviteeRegion: RegionCode!
    ) {
        claim_uma_invitation_with_incentives(input: {
            invitation_code: $invitationCode
            invitee_uma: $inviteeUma
            invitee_phone_hash: $inviteePhoneHash
            invitee_region: $inviteeRegion
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
