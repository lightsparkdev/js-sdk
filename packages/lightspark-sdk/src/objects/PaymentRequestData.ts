// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import BitcoinNetwork from "./BitcoinNetwork.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type InvoiceData from "./InvoiceData.js";
import { NodeFromJson, NodeToJson } from "./Node.js";

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
      destination: NodeFromJson(obj["invoice_data_destination"]),
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
      invoice_data_destination: NodeToJson(invoiceData.destination),
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
            ... on LightsparkNodeWithOSK {
                __typename
                lightspark_node_with_o_s_k_id: id
                lightspark_node_with_o_s_k_created_at: created_at
                lightspark_node_with_o_s_k_updated_at: updated_at
                lightspark_node_with_o_s_k_alias: alias
                lightspark_node_with_o_s_k_bitcoin_network: bitcoin_network
                lightspark_node_with_o_s_k_color: color
                lightspark_node_with_o_s_k_conductivity: conductivity
                lightspark_node_with_o_s_k_display_name: display_name
                lightspark_node_with_o_s_k_public_key: public_key
                lightspark_node_with_o_s_k_owner: owner {
                    id
                }
                lightspark_node_with_o_s_k_status: status
                lightspark_node_with_o_s_k_total_balance: total_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_o_s_k_total_local_balance: total_local_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_o_s_k_local_balance: local_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_o_s_k_remote_balance: remote_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_o_s_k_blockchain_balance: blockchain_balance {
                    __typename
                    blockchain_balance_total_balance: total_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_confirmed_balance: confirmed_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_locked_balance: locked_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_required_reserve: required_reserve {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_available_balance: available_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                }
                lightspark_node_with_o_s_k_uma_prescreening_utxos: uma_prescreening_utxos
                lightspark_node_with_o_s_k_balances: balances {
                    __typename
                    balances_owned_balance: owned_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    balances_available_to_send_balance: available_to_send_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    balances_available_to_withdraw_balance: available_to_withdraw_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                }
                lightspark_node_with_o_s_k_encrypted_signing_private_key: encrypted_signing_private_key {
                    __typename
                    secret_encrypted_value: encrypted_value
                    secret_cipher: cipher
                }
            }
            ... on LightsparkNodeWithRemoteSigning {
                __typename
                lightspark_node_with_remote_signing_id: id
                lightspark_node_with_remote_signing_created_at: created_at
                lightspark_node_with_remote_signing_updated_at: updated_at
                lightspark_node_with_remote_signing_alias: alias
                lightspark_node_with_remote_signing_bitcoin_network: bitcoin_network
                lightspark_node_with_remote_signing_color: color
                lightspark_node_with_remote_signing_conductivity: conductivity
                lightspark_node_with_remote_signing_display_name: display_name
                lightspark_node_with_remote_signing_public_key: public_key
                lightspark_node_with_remote_signing_owner: owner {
                    id
                }
                lightspark_node_with_remote_signing_status: status
                lightspark_node_with_remote_signing_total_balance: total_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_remote_signing_total_local_balance: total_local_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_remote_signing_local_balance: local_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_remote_signing_remote_balance: remote_balance {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                lightspark_node_with_remote_signing_blockchain_balance: blockchain_balance {
                    __typename
                    blockchain_balance_total_balance: total_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_confirmed_balance: confirmed_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_locked_balance: locked_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_required_reserve: required_reserve {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    blockchain_balance_available_balance: available_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                }
                lightspark_node_with_remote_signing_uma_prescreening_utxos: uma_prescreening_utxos
                lightspark_node_with_remote_signing_balances: balances {
                    __typename
                    balances_owned_balance: owned_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    balances_available_to_send_balance: available_to_send_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    balances_available_to_withdraw_balance: available_to_withdraw_balance {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                }
            }
        }
    }
}`;

export default PaymentRequestData;
