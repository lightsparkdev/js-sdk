// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const FetchUmaInvitation = `
    query FetchUmaInvitation(
        $invitationCode: String!
    ) {
        uma_invitation_by_code(code: $invitationCode) {
            ...UmaInvitationFragment
        }
    }

${UmaInvitationFragment}
`;
