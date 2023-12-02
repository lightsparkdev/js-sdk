// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Invoice from "./Invoice.js";
import { InvoiceDataFromJson, InvoiceDataToJson } from "./InvoiceData.js";
import type PaymentRequestData from "./PaymentRequestData.js";
import PaymentRequestStatus from "./PaymentRequestStatus.js";

/**
 * This object contains information related to a payment request generated or received by a
 * LightsparkNode. You can retrieve this object to receive payment information about a specific
 * invoice. *
 */
interface PaymentRequest {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The details of the payment request. **/
  data: PaymentRequestData;

  /** The status of the payment request. **/
  status: PaymentRequestStatus;

  /** The typename of the object **/
  typename: string;
}

export const PaymentRequestFromJson = (obj: any): PaymentRequest => {
  if (obj["__typename"] == "Invoice") {
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
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface PaymentRequest corresponding to the typename=${obj["__typename"]}`,
  );
};
export const PaymentRequestToJson = (obj: PaymentRequest): any => {
  if (obj.typename == "Invoice") {
    const invoice = obj as Invoice;
    return {
      __typename: "Invoice",
      invoice_id: invoice.id,
      invoice_created_at: invoice.createdAt,
      invoice_updated_at: invoice.updatedAt,
      invoice_data: InvoiceDataToJson(invoice.data),
      invoice_status: invoice.status,
      invoice_amount_paid: invoice.amountPaid
        ? CurrencyAmountToJson(invoice.amountPaid)
        : undefined,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface PaymentRequest corresponding to the typename=${obj.typename}`,
  );
};

export const FRAGMENT = `
fragment PaymentRequestFragment on PaymentRequest {
    __typename
    ... on Invoice {
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
    }
}`;

export const getPaymentRequestQuery = (id: string): Query<PaymentRequest> => {
  return {
    queryPayload: `
query GetPaymentRequest($id: ID!) {
    entity(id: $id) {
        ... on PaymentRequest {
            ...PaymentRequestFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => PaymentRequestFromJson(data.entity),
  };
};

export default PaymentRequest;
