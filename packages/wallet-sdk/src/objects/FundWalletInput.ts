// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FundWalletInput {
  amountSats?: number | undefined;
}

export const FundWalletInputFromJson = (obj: any): FundWalletInput => {
  return {
    amountSats: obj["fund_wallet_input_amount_sats"],
  } as FundWalletInput;
};
export const FundWalletInputToJson = (obj: FundWalletInput): any => {
  return {
    fund_wallet_input_amount_sats: obj.amountSats,
  };
};

export default FundWalletInput;
