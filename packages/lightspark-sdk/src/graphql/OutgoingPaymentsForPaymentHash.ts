// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as OutgoingPaymentFragment } from "../objects/OutgoingPayment.js";

export const OutgoingPaymentsForPaymentHash = `
query OutgoingPaymentsForPaymentHash(
	$payment_hash: Hash32!
	$statuses: [TransactionStatus!]
) {
	outgoing_payments_for_payment_hash(input: {
		payment_hash: $payment_hash
		statuses: $statuses
	}) {
		payments {
			...OutgoingPaymentFragment
		}
	}
}

  ${OutgoingPaymentFragment}
`;
