// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const CreateUmaInvitation = `
    mutation CreateUmaInvitation(
        $inviterUma: String!
    ) {
        create_uma_invitation(input: {
            inviter_uma: $inviterUma
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
