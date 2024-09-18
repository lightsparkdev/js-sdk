// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FundWalletInput {
  amountSats?: number | undefined;

  fundingAddress?: string | undefined;
}

export const FundWalletInputFromJson = (obj: any): FundWalletInput => {
  return {
    amountSats: obj["fund_wallet_input_amount_sats"],
    fundingAddress: obj["fund_wallet_input_funding_address"],
  } as FundWalletInput;
};
export const FundWalletInputToJson = (obj: FundWalletInput): any => {
  return {
    fund_wallet_input_amount_sats: obj.amountSats,
    fund_wallet_input_funding_address: obj.fundingAddress,
  };
};

export default FundWalletInput;
