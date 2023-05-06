// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as LightningFeeEstimateOutputFragment } from "../objects/LightningFeeEstimateOutput.js";

const LightningFeeEstimateForInvoiceQuery = `
  query LightningFeeEstimateForInvoice(
    $encoded_payment_request: String!
    $amount_msats: Long
  ) {
    lightning_fee_estimate_for_invoice(input: {
      encoded_payment_request: $encoded_payment_request,
      amount_msats: $amount_msats
    }) {
      ...LightningFeeEstimateOutputFragment
    }
  }

  ${LightningFeeEstimateOutputFragment}
`;

export default LightningFeeEstimateForInvoiceQuery;
