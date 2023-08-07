// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import type InvoiceData from "./InvoiceData.js";
import { InvoiceDataFromJson } from "./InvoiceData.js";
import type PaymentRequest from "./PaymentRequest.js";
import PaymentRequestStatus from "./PaymentRequestStatus.js";

/** This object represents a BOLT #11 invoice (https://github.com/lightning/bolts/blob/master/11-payment-encoding.md) initiated by a Lightspark Node. **/
type Invoice = PaymentRequest &
  Entity & {
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque
     * string.
     **/
    id: string;

    /** The date and time when the entity was first created. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** The details of the invoice. **/
    data: InvoiceData;

    /** The status of the payment request. **/
    status: PaymentRequestStatus;

    /** The typename of the object **/
    typename: string;

    /** The total amount that has been paid to this invoice. **/
    amountPaid?: CurrencyAmount;
  };

export const InvoiceFromJson = (obj: any): Invoice => {
  return {
    id: obj["invoice_id"],
    createdAt: obj["invoice_created_at"],
    updatedAt: obj["invoice_updated_at"],
    data: InvoiceDataFromJson(obj["invoice_data"]),
    status:
      PaymentRequestStatus[obj["invoice_status"]] ??
      PaymentRequestStatus.FUTURE_VALUE,
    typename: "Invoice",
    amountPaid: !!obj["invoice_amount_paid"]
      ? CurrencyAmountFromJson(obj["invoice_amount_paid"])
      : undefined,
  } as Invoice;
};

export const FRAGMENT = `
fragment InvoiceFragment on Invoice {
    __typename
    invoice_id: id
    invoice_created_at: created_at
    invoice_updated_at: updated_at
    invoice_data: data {
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
    invoice_status: status
    invoice_amount_paid: amount_paid {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export const getInvoiceQuery = (id: string): Query<Invoice> => {
  return {
    queryPayload: `
query GetInvoice($id: ID!) {
    entity(id: $id) {
        ... on Invoice {
            ...InvoiceFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => InvoiceFromJson(data.entity),
  };
};

export default Invoice;
