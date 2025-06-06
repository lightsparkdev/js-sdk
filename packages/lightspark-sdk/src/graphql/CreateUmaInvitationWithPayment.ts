// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as UmaInvitationFragment } from "../objects/UmaInvitation.js";

export const CreateUmaInvitationWithPayment = `
    mutation CreateUmaInvitationWithPayment(
        $inviterUma: String!
        $paymentAmount: Int!
        $paymentCurrency: UmaCurrencyInput!
        $expiresAt: DateTime!
    ) {
        create_uma_invitation_with_payment(input: {
            inviter_uma: $inviterUma
            payment_amount: $paymentAmount
            payment_currency: $paymentCurrency
            expires_at: $expiresAt
        }) {
            invitation {
                ...UmaInvitationFragment
            }
        }
    }

${UmaInvitationFragment}
`;
