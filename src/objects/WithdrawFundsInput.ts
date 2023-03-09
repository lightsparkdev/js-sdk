// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmountInput from "./CurrencyAmountInput.js";
import { CurrencyAmountInputFromJson } from "./CurrencyAmountInput.js";

type WithdrawFundsInput = {
  /** The node from where you want to withdraw money. **/
  nodeId: string;

  /** The bitcoin address where the withdrawal should be sent. **/
  bitcoinAddress: string;

  /** The amount you want to withdraw from your node. **/
  amount: CurrencyAmountInput;
};

export const WithdrawFundsInputFromJson = (obj: any): WithdrawFundsInput => {
  return {
    nodeId: obj["withdraw_funds_input_node_id"],
    bitcoinAddress: obj["withdraw_funds_input_bitcoin_address"],
    amount: CurrencyAmountInputFromJson(obj["withdraw_funds_input_amount"]),
  } as WithdrawFundsInput;
};

export default WithdrawFundsInput;
