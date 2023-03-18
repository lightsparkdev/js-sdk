// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmountInput, {
  CurrencyAmountInputFromJson,
} from "./CurrencyAmountInput.js";

type SendPaymentInput = {
  /** The node from where you want to send the payment. **/
  nodeId: string;

  /** The public key of the destination node. **/
  destinationPublicKey: string;

  /** The timeout in seconds that we will try to make the payment. **/
  timeoutSecs: number;

  /** The amount you will send to the destination node. **/
  amount: CurrencyAmountInput;

  /** The maximum amount of fees that you want to pay for this payment to be sent. **/
  maximumFees?: CurrencyAmountInput;
};

export const SendPaymentInputFromJson = (obj: any): SendPaymentInput => {
  return {
    nodeId: obj["send_payment_input_node_id"],
    destinationPublicKey: obj["send_payment_input_destination_public_key"],
    timeoutSecs: obj["send_payment_input_timeout_secs"],
    amount: CurrencyAmountInputFromJson(obj["send_payment_input_amount"]),
    maximumFees: !!obj["send_payment_input_maximum_fees"]
      ? CurrencyAmountInputFromJson(obj["send_payment_input_maximum_fees"])
      : undefined,
  } as SendPaymentInput;
};

export default SendPaymentInput;
