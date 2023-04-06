// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import WithdrawalMode from "./WithdrawalMode.js";
import WithdrawalRequestStatus from "./WithdrawalRequestStatus.js";
import WithdrawalRequestToChannelClosingTransactionsConnection, {
  WithdrawalRequestToChannelClosingTransactionsConnectionFromJson,
} from "./WithdrawalRequestToChannelClosingTransactionsConnection.js";
import WithdrawalRequestToChannelOpeningTransactionsConnection, {
  WithdrawalRequestToChannelOpeningTransactionsConnectionFromJson,
} from "./WithdrawalRequestToChannelOpeningTransactionsConnection.js";

class WithdrawalRequest implements Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly amount: CurrencyAmount,
    public readonly bitcoinAddress: string,
    public readonly withdrawalMode: WithdrawalMode,
    public readonly status: WithdrawalRequestStatus,
    public readonly typename: string,
    public readonly completedAt?: string,
    public readonly withdrawalId?: string
  ) {
    autoBind(this);
  }

  public async getChannelClosingTransactions(
    client: LightsparkClient,
    first: number | undefined = undefined
  ): Promise<WithdrawalRequestToChannelClosingTransactionsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWithdrawalRequestToChannelClosingTransactionsConnection($entity_id: ID!, $first: Int) {
    entity(id: $entity_id) {
        ... on WithdrawalRequest {
            channel_closing_transactions(, first: $first) {
                __typename
                withdrawal_request_to_channel_closing_transactions_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                withdrawal_request_to_channel_closing_transactions_connection_count: count
                withdrawal_request_to_channel_closing_transactions_connection_entities: entities {
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
                    channel_closing_transaction_channel: channel {
                        id
                    }
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first },
      constructObject: (json) => {
        const connection = json["entity"]["channel_closing_transactions"];
        return WithdrawalRequestToChannelClosingTransactionsConnectionFromJson(
          connection
        );
      },
    }))!;
  }

  public async getChannelOpeningTransactions(
    client: LightsparkClient,
    first: number | undefined = undefined
  ): Promise<WithdrawalRequestToChannelOpeningTransactionsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWithdrawalRequestToChannelOpeningTransactionsConnection($entity_id: ID!, $first: Int) {
    entity(id: $entity_id) {
        ... on WithdrawalRequest {
            channel_opening_transactions(, first: $first) {
                __typename
                withdrawal_request_to_channel_opening_transactions_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                withdrawal_request_to_channel_opening_transactions_connection_count: count
                withdrawal_request_to_channel_opening_transactions_connection_entities: entities {
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
                    channel_opening_transaction_channel: channel {
                        id
                    }
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first },
      constructObject: (json) => {
        const connection = json["entity"]["channel_opening_transactions"];
        return WithdrawalRequestToChannelOpeningTransactionsConnectionFromJson(
          connection
        );
      },
    }))!;
  }

  static getWithdrawalRequestQuery(id: string): Query<WithdrawalRequest> {
    return {
      queryPayload: `
query GetWithdrawalRequest($id: ID!) {
    entity(id: $id) {
        ... on WithdrawalRequest {
            ...WithdrawalRequestFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => WithdrawalRequestFromJson(data.entity),
    };
  }
}

export const WithdrawalRequestFromJson = (obj: any): WithdrawalRequest => {
  return new WithdrawalRequest(
    obj["withdrawal_request_id"],
    obj["withdrawal_request_created_at"],
    obj["withdrawal_request_updated_at"],
    CurrencyAmountFromJson(obj["withdrawal_request_amount"]),
    obj["withdrawal_request_bitcoin_address"],
    WithdrawalMode[obj["withdrawal_request_withdrawal_mode"]] ??
      WithdrawalMode.FUTURE_VALUE,
    WithdrawalRequestStatus[obj["withdrawal_request_status"]] ??
      WithdrawalRequestStatus.FUTURE_VALUE,
    "WithdrawalRequest",
    obj["withdrawal_request_completed_at"],
    obj["withdrawal_request_withdrawal"]?.id ?? undefined
  );
};

export const FRAGMENT = `
fragment WithdrawalRequestFragment on WithdrawalRequest {
    __typename
    withdrawal_request_id: id
    withdrawal_request_created_at: created_at
    withdrawal_request_updated_at: updated_at
    withdrawal_request_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_request_bitcoin_address: bitcoin_address
    withdrawal_request_withdrawal_mode: withdrawal_mode
    withdrawal_request_status: status
    withdrawal_request_completed_at: completed_at
    withdrawal_request_withdrawal: withdrawal {
        id
    }
}`;

export default WithdrawalRequest;
