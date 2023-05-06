// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import BitcoinNetwork from "./BitcoinNetwork.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import InvoiceData from "./InvoiceData.js";

/** The interface of a payment request on the Lightning Network (a.k.a. Lightning Invoice). **/
type PaymentRequestData = {
  encodedPaymentRequest: string;

  bitcoinNetwork: BitcoinNetwork;

  /** The typename of the object **/
  typename: string;
};

export const PaymentRequestDataFromJson = (obj: any): PaymentRequestData => {
  if (obj["__typename"] == "InvoiceData") {
    return {
      encodedPaymentRequest: obj["invoice_data_encoded_payment_request"],
      bitcoinNetwork:
        BitcoinNetwork[obj["invoice_data_bitcoin_network"]] ??
        BitcoinNetwork.FUTURE_VALUE,
      paymentHash: obj["invoice_data_payment_hash"],
      amount: CurrencyAmountFromJson(obj["invoice_data_amount"]),
      createdAt: obj["invoice_data_created_at"],
      expiresAt: obj["invoice_data_expires_at"],
      typename: "InvoiceData",
      memo: obj["invoice_data_memo"],
    } as InvoiceData;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface PaymentRequestData corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment PaymentRequestDataFragment on PaymentRequestData {
    __typename
    ... on InvoiceData {
        __typename
        invoice_data_encoded_payment_request: encoded_payment_request
        invoice_data_bitcoin_network: bitcoin_network
        invoice_data_payment_hash: payment_hash
        invoice_data_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        invoice_data_created_at: created_at
        invoice_data_expires_at: expires_at
        invoice_data_memo: memo
    }
}`;

export default PaymentRequestData;
