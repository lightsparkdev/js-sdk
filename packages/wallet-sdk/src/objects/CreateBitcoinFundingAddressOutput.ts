// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateBitcoinFundingAddressOutput {
  bitcoinAddress: string;
}

export const CreateBitcoinFundingAddressOutputFromJson = (
  obj: any,
): CreateBitcoinFundingAddressOutput => {
  return {
    bitcoinAddress:
      obj["create_bitcoin_funding_address_output_bitcoin_address"],
  } as CreateBitcoinFundingAddressOutput;
};
export const CreateBitcoinFundingAddressOutputToJson = (
  obj: CreateBitcoinFundingAddressOutput,
): any => {
  return {
    create_bitcoin_funding_address_output_bitcoin_address: obj.bitcoinAddress,
  };
};

export const FRAGMENT = `
fragment CreateBitcoinFundingAddressOutputFragment on CreateBitcoinFundingAddressOutput {
    __typename
    create_bitcoin_funding_address_output_bitcoin_address: bitcoin_address
}`;

export default CreateBitcoinFundingAddressOutput;
