// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import BitcoinNetwork from "./BitcoinNetwork.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import InvoiceData from "./InvoiceData.js";
import { NodeFromJson } from "./Node.js";

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
      bitcoinNetwork: BitcoinNetwork[obj["invoice_data_bitcoin_network"]],
      paymentHash: obj["invoice_data_payment_hash"],
      amount: CurrencyAmountFromJson(obj["invoice_data_amount"]),
      createdAt: obj["invoice_data_created_at"],
      expiresAt: obj["invoice_data_expires_at"],
      destination: NodeFromJson(obj["invoice_data_destination"]),
      typename: "InvoiceData",
      memo: obj["invoice_data_memo"],
    } as InvoiceData;
  }
  throw new Error(
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
}`;

export default PaymentRequestData;
