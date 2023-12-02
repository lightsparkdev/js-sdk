// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import BitcoinNetwork from "./BitcoinNetwork.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Node from "./Node.js";
import { NodeFromJson, NodeToJson } from "./Node.js";

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
  destination: Node;

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
    destination: NodeFromJson(obj["invoice_data_destination"]),
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
    invoice_data_destination: NodeToJson(obj.destination),
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
}`;

export default InvoiceData;
