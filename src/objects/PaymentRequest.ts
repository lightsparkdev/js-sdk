// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Entity from "./Entity.js";
import Query from "../requester/Query.js";
import PaymentRequestData from "./PaymentRequestData.js";
import Invoice from "./Invoice.js";
import PaymentRequestStatus from "./PaymentRequestStatus.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import { InvoiceDataFromJson } from "./InvoiceData.js";

type PaymentRequest = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
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
};

export const PaymentRequestFromJson = (obj: any): PaymentRequest => {
  if (obj["__typename"] == "Invoice") {
    return {
      id: obj["invoice_id"],
      createdAt: obj["invoice_created_at"],
      updatedAt: obj["invoice_updated_at"],
      data: InvoiceDataFromJson(obj["invoice_data"]),
      status: PaymentRequestStatus[obj["invoice_status"]],
      typename: "Invoice",
      amountPaid: !!obj["invoice_amount_paid"]
        ? CurrencyAmountFromJson(obj["invoice_amount_paid"])
        : undefined,
    } as Invoice;
  }
  throw new Error(
    `Couldn't find a concrete type for interface PaymentRequest corresponding to the typename=${obj["__typename"]}`
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
                currency_amount_value: value
                currency_amount_unit: unit
            }
            invoice_data_created_at: created_at
            invoice_data_expires_at: expires_at
            invoice_data_destination: destination {
                __typename
                ... on LightsparkNode {
                    __typename
                    lightspark_node_id: id
                    lightspark_node_created_at: created_at
                    lightspark_node_updated_at: updated_at
                    lightspark_node_alias: alias
                    lightspark_node_bitcoin_network: bitcoin_network
                    lightspark_node_color: color
                    lightspark_node_conductivity: conductivity
                    lightspark_node_display_name: display_name
                    lightspark_node_public_key: public_key
                    lightspark_node_account: account {
                        id
                    }
                    lightspark_node_blockchain_balance: blockchain_balance {
                        __typename
                        blockchain_balance_total_balance: total_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_confirmed_balance: confirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_locked_balance: locked_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_required_reserve: required_reserve {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_available_balance: available_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                    }
                    lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encryption_public_key: encryption_public_key {
                        __typename
                        key_type: type
                        key_public_key: public_key
                    }
                    lightspark_node_grpc_hostname: grpc_hostname
                    lightspark_node_local_balance: local_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_name: name
                    lightspark_node_purpose: purpose
                    lightspark_node_remote_balance: remote_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_rest_url: rest_url
                    lightspark_node_status: status
                    lightspark_node_upgrade_available: upgrade_available
                }
                ... on GraphNode {
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
            invoice_data_memo: memo
        }
        invoice_status: status
        invoice_amount_paid: amount_paid {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
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
