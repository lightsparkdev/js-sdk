// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as FeeEstimateFragment } from "../objects/FeeEstimate.js";

const BitcoinFeeEstimateQuery = `
  query BitcoinFeeEstimate {
    bitcoin_fee_estimate {
      ...FeeEstimateFragment
    }
  }

  ${FeeEstimateFragment}
`;

export default BitcoinFeeEstimateQuery;
