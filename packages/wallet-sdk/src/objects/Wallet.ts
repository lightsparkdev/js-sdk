// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type Balances from "./Balances.js";
import { BalancesFromJson, BalancesToJson } from "./Balances.js";
import type Entity from "./Entity.js";
import type TransactionStatus from "./TransactionStatus.js";
import type TransactionType from "./TransactionType.js";
import WalletStatus from "./WalletStatus.js";
import type WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import { WalletToPaymentRequestsConnectionFromJson } from "./WalletToPaymentRequestsConnection.js";
import type WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";
import { WalletToTransactionsConnectionFromJson } from "./WalletToTransactionsConnection.js";

class Wallet implements Entity {
  constructor(
    /**
     * The unique identifier of this entity across all Lightspark systems.
     * Should be treated as an opaque string.
     **/
    public readonly id: string,
    /** The date and time when the entity was first created. **/
    public readonly createdAt: string,
    /** The date and time when the entity was last updated. **/
    public readonly updatedAt: string,
    /** The status of this wallet. **/
    public readonly status: WalletStatus,
    /** The typename of the object **/
    public readonly typename: string,
    /** The balances that describe the funds in this wallet. **/
    public readonly balances?: Balances | undefined,
  ) {
    autoBind(this);
  }

  public async getTransactions(
    client: LightsparkClient,
    first: number | undefined = undefined,
    after: string | undefined = undefined,
    createdAfterDate: string | undefined = undefined,
    createdBeforeDate: string | undefined = undefined,
    statuses: TransactionStatus[] | undefined = undefined,
    types: TransactionType[] | undefined = undefined,
  ): Promise<WalletToTransactionsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWalletToTransactionsConnection($first: Int, $after: ID, $created_after_date: DateTime, $created_before_date: DateTime, $statuses: [TransactionStatus!], $types: [TransactionType!]) {
    current_wallet {
        ... on Wallet {
            transactions(, first: $first, after: $after, created_after_date: $created_after_date, created_before_date: $created_before_date, statuses: $statuses, types: $types) {
                __typename
                wallet_to_transactions_connection_count: count
                wallet_to_transactions_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                wallet_to_transactions_connection_entities: entities {
                    __typename
                    ... on ChannelClosingTransaction {
                        __typename
                        channel_closing_transaction_id: id
                        channel_closing_transaction_created_at: created_at
                        channel_closing_transaction_updated_at: updated_at
                        channel_closing_transaction_status: status
                        channel_closing_transaction_resolved_at: resolved_at
                        channel_closing_transaction_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        channel_closing_transaction_transaction_hash: transaction_hash
                        channel_closing_transaction_fees: fees {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        channel_closing_transaction_block_hash: block_hash
                        channel_closing_transaction_block_height: block_height
                        channel_closing_transaction_destination_addresses: destination_addresses
                        channel_closing_transaction_num_confirmations: num_confirmations
                    }
                    ... on ChannelOpeningTransaction {
                        __typename
                        channel_opening_transaction_id: id
                        channel_opening_transaction_created_at: created_at
                        channel_opening_transaction_updated_at: updated_at
                        channel_opening_transaction_status: status
                        channel_opening_transaction_resolved_at: resolved_at
                        channel_opening_transaction_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        channel_opening_transaction_transaction_hash: transaction_hash
                        channel_opening_transaction_fees: fees {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        channel_opening_transaction_block_hash: block_hash
                        channel_opening_transaction_block_height: block_height
                        channel_opening_transaction_destination_addresses: destination_addresses
                        channel_opening_transaction_num_confirmations: num_confirmations
                    }
                    ... on Deposit {
                        __typename
                        deposit_id: id
                        deposit_created_at: created_at
                        deposit_updated_at: updated_at
                        deposit_status: status
                        deposit_resolved_at: resolved_at
                        deposit_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        deposit_transaction_hash: transaction_hash
                        deposit_fees: fees {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        deposit_block_hash: block_hash
                        deposit_block_height: block_height
                        deposit_destination_addresses: destination_addresses
                        deposit_num_confirmations: num_confirmations
                    }
                    ... on IncomingPayment {
                        __typename
                        incoming_payment_id: id
                        incoming_payment_created_at: created_at
                        incoming_payment_updated_at: updated_at
                        incoming_payment_status: status
                        incoming_payment_resolved_at: resolved_at
                        incoming_payment_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        incoming_payment_transaction_hash: transaction_hash
                        incoming_payment_payment_request: payment_request {
                            id
                        }
                    }
                    ... on OutgoingPayment {
                        __typename
                        outgoing_payment_id: id
                        outgoing_payment_created_at: created_at
                        outgoing_payment_updated_at: updated_at
                        outgoing_payment_status: status
                        outgoing_payment_resolved_at: resolved_at
                        outgoing_payment_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        outgoing_payment_transaction_hash: transaction_hash
                        outgoing_payment_fees: fees {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        outgoing_payment_payment_request_data: payment_request_data {
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
                        }
                        outgoing_payment_failure_reason: failure_reason
                        outgoing_payment_failure_message: failure_message {
                            __typename
                            rich_text_text: text
                        }
                        outgoing_payment_payment_preimage: payment_preimage
                    }
                    ... on Withdrawal {
                        __typename
                        withdrawal_id: id
                        withdrawal_created_at: created_at
                        withdrawal_updated_at: updated_at
                        withdrawal_status: status
                        withdrawal_resolved_at: resolved_at
                        withdrawal_amount: amount {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        withdrawal_transaction_hash: transaction_hash
                        withdrawal_fees: fees {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        withdrawal_block_hash: block_hash
                        withdrawal_block_height: block_height
                        withdrawal_destination_addresses: destination_addresses
                        withdrawal_num_confirmations: num_confirmations
                    }
                }
            }
        }
    }
}
`,
      variables: {
        first: first,
        after: after,
        created_after_date: createdAfterDate,
        created_before_date: createdBeforeDate,
        statuses: statuses,
        types: types,
      },
      constructObject: (json) => {
        const connection = json["current_wallet"]["transactions"];
        return WalletToTransactionsConnectionFromJson(connection);
      },
    }))!;
  }

  public async getPaymentRequests(
    client: LightsparkClient,
    first: number | undefined = undefined,
    after: string | undefined = undefined,
    createdAfterDate: string | undefined = undefined,
    createdBeforeDate: string | undefined = undefined,
  ): Promise<WalletToPaymentRequestsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWalletToPaymentRequestsConnection($first: Int, $after: ID, $created_after_date: DateTime, $created_before_date: DateTime) {
    current_wallet {
        ... on Wallet {
            payment_requests(, first: $first, after: $after, created_after_date: $created_after_date, created_before_date: $created_before_date) {
                __typename
                wallet_to_payment_requests_connection_count: count
                wallet_to_payment_requests_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                wallet_to_payment_requests_connection_entities: entities {
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
                }
            }
        }
    }
}
`,
      variables: {
        first: first,
        after: after,
        created_after_date: createdAfterDate,
        created_before_date: createdBeforeDate,
      },
      constructObject: (json) => {
        const connection = json["current_wallet"]["payment_requests"];
        return WalletToPaymentRequestsConnectionFromJson(connection);
      },
    }))!;
  }

  static getWalletQuery(): Query<Wallet> {
    return {
      queryPayload: `
query GetWallet {
    current_wallet {
        ... on Wallet {
            ...WalletFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: {},
      constructObject: (data: any) => WalletFromJson(data.current_wallet),
    };
  }

  public toJson() {
    return {
      __typename: "Wallet",
      wallet_id: this.id,
      wallet_created_at: this.createdAt,
      wallet_updated_at: this.updatedAt,
      wallet_balances: this.balances
        ? BalancesToJson(this.balances)
        : undefined,
      wallet_status: this.status,
    };
  }
}

export const WalletFromJson = (obj: any): Wallet => {
  return new Wallet(
    obj["wallet_id"],
    obj["wallet_created_at"],
    obj["wallet_updated_at"],
    WalletStatus[obj["wallet_status"]] ?? WalletStatus.FUTURE_VALUE,
    "Wallet",
    !!obj["wallet_balances"]
      ? BalancesFromJson(obj["wallet_balances"])
      : undefined,
  );
};

export const FRAGMENT = `
fragment WalletFragment on Wallet {
    __typename
    wallet_id: id
    wallet_created_at: created_at
    wallet_updated_at: updated_at
    wallet_balances: balances {
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
    wallet_status: status
}`;

export default Wallet;
