// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import BitcoinNetwork from "./BitcoinNetwork.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import { GraphNodeFromJson } from "./GraphNode.js";
import type InvoiceData from "./InvoiceData.js";

/**
 * This object is an interface of a payment request on the Lightning Network (i.e., a Lightning
 * Invoice). It contains data related to parsing the payment details of a Lightning Invoice. *
 */
interface PaymentRequestData {
  encodedPaymentRequest: string;

  bitcoinNetwork: BitcoinNetwork;

  /** The typename of the object **/
  typename: string;
}

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
      destination: GraphNodeFromJson(obj["invoice_data_destination"]),
      typename: "InvoiceData",
      memo: obj["invoice_data_memo"],
    } as InvoiceData;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface PaymentRequestData corresponding to the typename=${obj["__typename"]}`,
  );
};
export const PaymentRequestDataToJson = (obj: PaymentRequestData): any => {
  if (obj.typename == "InvoiceData") {
    const invoiceData = obj as InvoiceData;
    return {
      __typename: "InvoiceData",
      invoice_data_encoded_payment_request: invoiceData.encodedPaymentRequest,
      invoice_data_bitcoin_network: invoiceData.bitcoinNetwork,
      invoice_data_payment_hash: invoiceData.paymentHash,
      invoice_data_amount: CurrencyAmountToJson(invoiceData.amount),
      invoice_data_created_at: invoiceData.createdAt,
      invoice_data_expires_at: invoiceData.expiresAt,
      invoice_data_memo: invoiceData.memo,
      invoice_data_destination: invoiceData.destination.toJson(),
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface PaymentRequestData corresponding to the typename=${obj.typename}`,
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
        invoice_data_destination: destination {
            __typename
            graph_node_id: id
            graph_node_created_at: created_at
            graph_node_updated_at: updated_at
            graph_node_alias: alias
            graph_node_bitcoin_network: bitcoin_network
            graph_node_color: color
            graph_node_conductivity: conductivity
            graph_node_display_name: display_name
            graph_node_public_key: public_key
        }
    }
}`;

export default PaymentRequestData;
