// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import CryptoSanctionsScreeningProvider from "./CryptoSanctionsScreeningProvider.js";

type ScreenBitcoinAddressesInput = {
  provider: CryptoSanctionsScreeningProvider;

  addresses: string[];
};

export const ScreenBitcoinAddressesInputFromJson = (
  obj: any,
): ScreenBitcoinAddressesInput => {
  return {
    provider:
      CryptoSanctionsScreeningProvider[
        obj["screen_bitcoin_addresses_input_provider"]
      ] ?? CryptoSanctionsScreeningProvider.FUTURE_VALUE,
    addresses: obj["screen_bitcoin_addresses_input_addresses"],
  } as ScreenBitcoinAddressesInput;
};

export default ScreenBitcoinAddressesInput;
