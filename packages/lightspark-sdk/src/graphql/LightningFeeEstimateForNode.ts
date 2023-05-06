// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as LightningFeeEstimateFragment } from "../objects/LightningFeeEstimateOutput.js";

export const LightningFeeEstimateForNode = `
  query LightningFeeEstimateForNode(
    $node_id: ID!
    $destination_node_public_key: String!
    $amount_msats: Long!
  ) {
    lightning_fee_estimate_for_node(input: {
      node_id: $node_id,
      destination_node_public_key: $destination_node_public_key,
      amount_msats: $amount_msats
    }) {
      ...LightningFeeEstimateOutputFragment
    }
  }

  ${LightningFeeEstimateFragment}
`;
