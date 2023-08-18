// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import AccountToApiTokensConnection from "./AccountToApiTokensConnection.js";
import AccountToNodesConnection from "./AccountToNodesConnection.js";
import AccountToPaymentRequestsConnection from "./AccountToPaymentRequestsConnection.js";
import AccountToTransactionsConnection from "./AccountToTransactionsConnection.js";
import AccountToWalletsConnection from "./AccountToWalletsConnection.js";
import { ApiTokenFromJson } from "./ApiToken.js";
import { ChannelFromJson } from "./Channel.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import { HopFromJson } from "./Hop.js";
import { IncomingPaymentAttemptFromJson } from "./IncomingPaymentAttempt.js";
import IncomingPaymentToAttemptsConnection from "./IncomingPaymentToAttemptsConnection.js";
import { LightsparkNodeFromJson } from "./LightsparkNode.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import LightsparkNodeToChannelsConnection from "./LightsparkNodeToChannelsConnection.js";
import { OutgoingPaymentAttemptFromJson } from "./OutgoingPaymentAttempt.js";
import OutgoingPaymentAttemptToHopsConnection from "./OutgoingPaymentAttemptToHopsConnection.js";
import OutgoingPaymentToAttemptsConnection from "./OutgoingPaymentToAttemptsConnection.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";
import { PaymentRequestFromJson } from "./PaymentRequest.js";
import { TransactionFromJson } from "./Transaction.js";
import { WalletFromJson } from "./Wallet.js";
import WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";

type Connection = {
  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The typename of the object **/
  typename: string;
};

export const ConnectionFromJson = (obj: any): Connection => {
  if (obj["__typename"] == "AccountToApiTokensConnection") {
    return {
      count: obj["account_to_api_tokens_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_api_tokens_connection_page_info"]
      ),
      entities: obj["account_to_api_tokens_connection_entities"].map((e) =>
        ApiTokenFromJson(e)
      ),
      typename: "AccountToApiTokensConnection",
    } as AccountToApiTokensConnection;
  }
  if (obj["__typename"] == "AccountToNodesConnection") {
    return {
      count: obj["account_to_nodes_connection_count"],
      pageInfo: PageInfoFromJson(obj["account_to_nodes_connection_page_info"]),
      entities: obj["account_to_nodes_connection_entities"].map((e) =>
        LightsparkNodeFromJson(e)
      ),
      typename: "AccountToNodesConnection",
      purpose: !!obj["account_to_nodes_connection_purpose"]
        ? LightsparkNodePurpose[obj["account_to_nodes_connection_purpose"]] ??
          LightsparkNodePurpose.FUTURE_VALUE
        : null,
    } as AccountToNodesConnection;
  }
  if (obj["__typename"] == "AccountToPaymentRequestsConnection") {
    return {
      count: obj["account_to_payment_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_payment_requests_connection_page_info"]
      ),
      entities: obj["account_to_payment_requests_connection_entities"].map(
        (e) => PaymentRequestFromJson(e)
      ),
      typename: "AccountToPaymentRequestsConnection",
    } as AccountToPaymentRequestsConnection;
  }
  if (obj["__typename"] == "AccountToTransactionsConnection") {
    return {
      count: obj["account_to_transactions_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_transactions_connection_page_info"]
      ),
      entities: obj["account_to_transactions_connection_entities"].map((e) =>
        TransactionFromJson(e)
      ),
      typename: "AccountToTransactionsConnection",
      profitLoss: !!obj["account_to_transactions_connection_profit_loss"]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_profit_loss"]
          )
        : undefined,
      averageFeeEarned: !!obj[
        "account_to_transactions_connection_average_fee_earned"
      ]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_average_fee_earned"]
          )
        : undefined,
      totalAmountTransacted: !!obj[
        "account_to_transactions_connection_total_amount_transacted"
      ]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_total_amount_transacted"]
          )
        : undefined,
    } as AccountToTransactionsConnection;
  }
  if (obj["__typename"] == "AccountToWalletsConnection") {
    return {
      count: obj["account_to_wallets_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_wallets_connection_page_info"]
      ),
      entities: obj["account_to_wallets_connection_entities"].map((e) =>
        WalletFromJson(e)
      ),
      typename: "AccountToWalletsConnection",
    } as AccountToWalletsConnection;
  }
  if (obj["__typename"] == "IncomingPaymentToAttemptsConnection") {
    return {
      count: obj["incoming_payment_to_attempts_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["incoming_payment_to_attempts_connection_page_info"]
      ),
      entities: obj["incoming_payment_to_attempts_connection_entities"].map(
        (e) => IncomingPaymentAttemptFromJson(e)
      ),
      typename: "IncomingPaymentToAttemptsConnection",
    } as IncomingPaymentToAttemptsConnection;
  }
  if (obj["__typename"] == "LightsparkNodeToChannelsConnection") {
    return {
      count: obj["lightspark_node_to_channels_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["lightspark_node_to_channels_connection_page_info"]
      ),
      entities: obj["lightspark_node_to_channels_connection_entities"].map(
        (e) => ChannelFromJson(e)
      ),
      typename: "LightsparkNodeToChannelsConnection",
    } as LightsparkNodeToChannelsConnection;
  }
  if (obj["__typename"] == "OutgoingPaymentAttemptToHopsConnection") {
    return {
      count: obj["outgoing_payment_attempt_to_hops_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["outgoing_payment_attempt_to_hops_connection_page_info"]
      ),
      entities: obj["outgoing_payment_attempt_to_hops_connection_entities"].map(
        (e) => HopFromJson(e)
      ),
      typename: "OutgoingPaymentAttemptToHopsConnection",
    } as OutgoingPaymentAttemptToHopsConnection;
  }
  if (obj["__typename"] == "OutgoingPaymentToAttemptsConnection") {
    return {
      count: obj["outgoing_payment_to_attempts_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["outgoing_payment_to_attempts_connection_page_info"]
      ),
      entities: obj["outgoing_payment_to_attempts_connection_entities"].map(
        (e) => OutgoingPaymentAttemptFromJson(e)
      ),
      typename: "OutgoingPaymentToAttemptsConnection",
    } as OutgoingPaymentToAttemptsConnection;
  }
  if (obj["__typename"] == "WalletToPaymentRequestsConnection") {
    return {
      count: obj["wallet_to_payment_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_payment_requests_connection_page_info"]
      ),
      entities: obj["wallet_to_payment_requests_connection_entities"].map((e) =>
        PaymentRequestFromJson(e)
      ),
      typename: "WalletToPaymentRequestsConnection",
    } as WalletToPaymentRequestsConnection;
  }
  if (obj["__typename"] == "WalletToTransactionsConnection") {
    return {
      count: obj["wallet_to_transactions_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_transactions_connection_page_info"]
      ),
      entities: obj["wallet_to_transactions_connection_entities"].map((e) =>
        TransactionFromJson(e)
      ),
      typename: "WalletToTransactionsConnection",
    } as WalletToTransactionsConnection;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Connection corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment ConnectionFragment on Connection {
    __typename
    ... on AccountToApiTokensConnection {
        __typename
        account_to_api_tokens_connection_count: count
        account_to_api_tokens_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_api_tokens_connection_entities: entities {
            id
        }
    }
    ... on AccountToNodesConnection {
        __typename
        account_to_nodes_connection_count: count
        account_to_nodes_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_nodes_connection_purpose: purpose
        account_to_nodes_connection_entities: entities {
            id
        }
    }
    ... on AccountToPaymentRequestsConnection {
        __typename
        account_to_payment_requests_connection_count: count
        account_to_payment_requests_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_payment_requests_connection_entities: entities {
            id
        }
    }
    ... on AccountToTransactionsConnection {
        __typename
        account_to_transactions_connection_count: count
        account_to_transactions_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_transactions_connection_profit_loss: profit_loss {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        account_to_transactions_connection_average_fee_earned: average_fee_earned {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        account_to_transactions_connection_total_amount_transacted: total_amount_transacted {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        account_to_transactions_connection_entities: entities {
            id
        }
    }
    ... on AccountToWalletsConnection {
        __typename
        account_to_wallets_connection_count: count
        account_to_wallets_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_wallets_connection_entities: entities {
            id
        }
    }
    ... on IncomingPaymentToAttemptsConnection {
        __typename
        incoming_payment_to_attempts_connection_count: count
        incoming_payment_to_attempts_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        incoming_payment_to_attempts_connection_entities: entities {
            id
        }
    }
    ... on LightsparkNodeToChannelsConnection {
        __typename
        lightspark_node_to_channels_connection_count: count
        lightspark_node_to_channels_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        lightspark_node_to_channels_connection_entities: entities {
            id
        }
    }
    ... on OutgoingPaymentAttemptToHopsConnection {
        __typename
        outgoing_payment_attempt_to_hops_connection_count: count
        outgoing_payment_attempt_to_hops_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        outgoing_payment_attempt_to_hops_connection_entities: entities {
            id
        }
    }
    ... on OutgoingPaymentToAttemptsConnection {
        __typename
        outgoing_payment_to_attempts_connection_count: count
        outgoing_payment_to_attempts_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        outgoing_payment_to_attempts_connection_entities: entities {
            id
        }
    }
    ... on WalletToPaymentRequestsConnection {
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
            id
        }
    }
    ... on WalletToTransactionsConnection {
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
            id
        }
    }
}`;

export default Connection;
