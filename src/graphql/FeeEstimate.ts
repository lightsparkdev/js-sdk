import { gql } from "@apollo/client/core";

export const FeeEstimate = gql`
  query FeeEstimate($bitcoin_network: BitcoinNetwork!) {
    fee_estimate(network: $bitcoin_network) {
      fee_fast {
        value
        unit
      }
      fee_min {
        value
        unit
      }
    }
  }
`;
