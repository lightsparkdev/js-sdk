// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const CreateUmaInvitationWithIncentives = `
    mutation CreateUmaInvitationWithIncentives(
        $inviterUma: String!
        $inviterPhoneHash: String!
        $inviterRegion: RegionCode!
    ) {
        create_uma_invitation_with_incentives(input: {
            inviter_uma: $inviterUma
            inviter_phone_hash: $inviterPhoneHash
            inviter_region: $inviterRegion
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
