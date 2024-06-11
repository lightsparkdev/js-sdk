// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

export const InvoiceForPaymentHash = `
query InvoiceForPaymentHash($payment_hash: Hash32!) {
	invoice_for_payment_hash(input: {
		payment_hash: $payment_hash
	}) {
		invoice {
			...InvoiceFragment
		}
	}
}

  ${InvoiceFragment}
`;
