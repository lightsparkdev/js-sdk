// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as IncomingPaymentFragment } from "../objects/IncomingPayment.js";

export const IncomingPaymentsForInvoice = `
query IncomingPaymentsForInvoice(
    $invoice_id: Hash32!,
    $statuses: [TransactionStatus!] 
) {
    incoming_payments_for_invoice(input: {
        invoice_id: $invoice_id
        statuses: $statuses
    }) {
        payments {
            ...IncomingPaymentFragment
        }
    }
}

${IncomingPaymentFragment}
`;
