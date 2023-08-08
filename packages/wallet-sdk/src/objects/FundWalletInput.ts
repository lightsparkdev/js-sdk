// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type FundWalletInput = {
  amountSats?: number;
};

export const FundWalletInputFromJson = (obj: any): FundWalletInput => {
  return {
    amountSats: obj["fund_wallet_input_amount_sats"],
  } as FundWalletInput;
};

export default FundWalletInput;
