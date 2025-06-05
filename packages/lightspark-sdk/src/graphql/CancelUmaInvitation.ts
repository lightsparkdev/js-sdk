// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const CancelUmaInvitation = `
    mutation CancelUmaInvitation(
        $inviteCode: String!
    ) {
        cancel_uma_invitation(input: {
            invite_code: $inviteCode
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
