// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type WithdrawFundsOutput = {
  /** The bitcoin transaction that represents the withdrawal that has been sent. **/
  transactionId: string;
};

export const WithdrawFundsOutputFromJson = (obj: any): WithdrawFundsOutput => {
  return {
    transactionId: obj["withdraw_funds_output_transaction"].id,
  } as WithdrawFundsOutput;
};

export const FRAGMENT = `
fragment WithdrawFundsOutputFragment on WithdrawFundsOutput {
    __typename
    withdraw_funds_output_transaction: transaction {
        id
    }
}`;

export default WithdrawFundsOutput;
