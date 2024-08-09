// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as OutgoingPaymentFragment } from "../objects/OutgoingPayment.js";

export const OutgoingPaymentsForInvoice = `
query OutgoingPaymentsForInvoice(
    $encoded_invoice: Hash32!,
    $statuses: [TransactionStatus!] 
) {
    outgoing_payments_for_invoice(input: {
        encoded_invoice: $encoded_invoice
        statuses: $statuses
    }) {
        payments {
            ...OutgoingPaymentFragment
        }
    }
}

${OutgoingPaymentFragment}
`;
