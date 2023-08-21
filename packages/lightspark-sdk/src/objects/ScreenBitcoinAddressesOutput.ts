// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RiskRating from "./RiskRating.js";

type ScreenBitcoinAddressesOutput = {
  ratings: RiskRating[];
};

export const ScreenBitcoinAddressesOutputFromJson = (
  obj: any
): ScreenBitcoinAddressesOutput => {
  return {
    ratings: obj["screen_bitcoin_addresses_output_ratings"].map(
      (e) => RiskRating[e]
    ),
  } as ScreenBitcoinAddressesOutput;
};

export const FRAGMENT = `
fragment ScreenBitcoinAddressesOutputFragment on ScreenBitcoinAddressesOutput {
    __typename
    screen_bitcoin_addresses_output_ratings: ratings
}`;

export default ScreenBitcoinAddressesOutput;
