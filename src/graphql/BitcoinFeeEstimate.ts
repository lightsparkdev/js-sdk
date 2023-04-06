// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as FeeEstimateFragment } from "../objects/FeeEstimate.js";

export const BitcoinFeeEstimate = `
  query BitcoinFeeEstimate($bitcoin_network: BitcoinNetwork!) {
    bitcoin_fee_estimate(network: $bitcoin_network) {
      ...FeeEstimateFragment
    }
  }

  ${FeeEstimateFragment}
`;
