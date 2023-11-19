// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const ClaimUmaInvitation = `
    mutation ClaimUmaInvitation(
        $invitationCode: String!
        $inviteeUma: String!
    ) {
        claim_uma_invitation(input: {
            invitation_code: $invitationCode
            invitee_uma: $inviteeUma
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
