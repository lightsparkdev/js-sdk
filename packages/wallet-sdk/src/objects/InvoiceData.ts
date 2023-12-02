// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import BitcoinNetwork from "./BitcoinNetwork.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type GraphNode from "./GraphNode.js";
import { GraphNodeFromJson } from "./GraphNode.js";

/**
 * This object represents the data associated with a BOLT #11 invoice. You can retrieve this object
 * to receive the relevant data associated with a specific invoice. *
 */
interface InvoiceData {
  encodedPaymentRequest: string;

  bitcoinNetwork: BitcoinNetwork;

  /** The payment hash of this invoice. **/
  paymentHash: string;

  /**
   * The requested amount in this invoice. If it is equal to 0, the sender should choose the
   * amount to send.
   **/
  amount: CurrencyAmount;

  /** The date and time when this invoice was created. **/
  createdAt: string;

  /** The date and time when this invoice will expire. **/
  expiresAt: string;

  /** The lightning node that will be paid when fulfilling this invoice. **/
  destination: GraphNode;

  /** The typename of the object **/
  typename: string;

  /** A short, UTF-8 encoded, description of the purpose of this invoice. **/
  memo?: string | undefined;
}

export const InvoiceDataFromJson = (obj: any): InvoiceData => {
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
};
export const InvoiceDataToJson = (obj: InvoiceData): any => {
  return {
    __typename: "InvoiceData",
    invoice_data_encoded_payment_request: obj.encodedPaymentRequest,
    invoice_data_bitcoin_network: obj.bitcoinNetwork,
    invoice_data_payment_hash: obj.paymentHash,
    invoice_data_amount: CurrencyAmountToJson(obj.amount),
    invoice_data_created_at: obj.createdAt,
    invoice_data_expires_at: obj.expiresAt,
    invoice_data_memo: obj.memo,
    invoice_data_destination: obj.destination.toJson(),
  };
};

export const FRAGMENT = `
fragment InvoiceDataFragment on InvoiceData {
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
}`;

export default InvoiceData;
