import { FRAGMENT as FeeEstimateFragment } from "../objects/FeeEstimate.js";

export const FeeEstimate = `
  query FeeEstimate($bitcoin_network: BitcoinNetwork!) {
    fee_estimate(network: $bitcoin_network) {
      ...FeeEstimateFragment
    }
  }

  ${FeeEstimateFragment}
`;
