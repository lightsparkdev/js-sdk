// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as LightningFeeEstimateOutputFragment } from "../objects/LightningFeeEstimateOutput.js";

const LightningFeeEstimateForNodeQuery = `
  query LightningFeeEstimateForNode(
    $destination_node_public_key: String!
    $amount_msats: Long!
  ) {
    lightning_fee_estimate_for_node(input: {
      destination_node_public_key: $destination_node_public_key,
      amount_msats: $amount_msats
    }) {
      ...LightningFeeEstimateOutputFragment
    }
  }

  ${LightningFeeEstimateOutputFragment}
`;

export default LightningFeeEstimateForNodeQuery;
