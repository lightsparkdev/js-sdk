// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import type AccountToApiTokensConnection from "./AccountToApiTokensConnection.js";
import type AccountToNodesConnection from "./AccountToNodesConnection.js";
import type AccountToPaymentRequestsConnection from "./AccountToPaymentRequestsConnection.js";
import type AccountToTransactionsConnection from "./AccountToTransactionsConnection.js";
import type AccountToWalletsConnection from "./AccountToWalletsConnection.js";
import type AccountToWithdrawalRequestsConnection from "./AccountToWithdrawalRequestsConnection.js";
import { ApiTokenFromJson, ApiTokenToJson } from "./ApiToken.js";
import { ChannelFromJson } from "./Channel.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import { HopFromJson, HopToJson } from "./Hop.js";
import {
  IncomingPaymentAttemptFromJson,
  IncomingPaymentAttemptToJson,
} from "./IncomingPaymentAttempt.js";
import type IncomingPaymentToAttemptsConnection from "./IncomingPaymentToAttemptsConnection.js";
import {
  LightsparkNodeFromJson,
  LightsparkNodeToJson,
} from "./LightsparkNode.js";
import type LightsparkNodeToChannelsConnection from "./LightsparkNodeToChannelsConnection.js";
import { OutgoingPaymentAttemptFromJson } from "./OutgoingPaymentAttempt.js";
import type OutgoingPaymentAttemptToHopsConnection from "./OutgoingPaymentAttemptToHopsConnection.js";
import type OutgoingPaymentToAttemptsConnection from "./OutgoingPaymentToAttemptsConnection.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";
import {
  PaymentRequestFromJson,
  PaymentRequestToJson,
} from "./PaymentRequest.js";
import { TransactionFromJson, TransactionToJson } from "./Transaction.js";
import { WalletFromJson } from "./Wallet.js";
import type WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import type WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";
import type WalletToWithdrawalRequestsConnection from "./WalletToWithdrawalRequestsConnection.js";
import { WithdrawalRequestFromJson } from "./WithdrawalRequest.js";

interface Connection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The typename of the object **/
  typename: string;
}

export const ConnectionFromJson = (obj: any): Connection => {
  if (obj["__typename"] == "AccountToApiTokensConnection") {
    return {
      count: obj["account_to_api_tokens_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_api_tokens_connection_page_info"],
      ),
      entities: obj["account_to_api_tokens_connection_entities"].map((e) =>
        ApiTokenFromJson(e),
      ),
      typename: "AccountToApiTokensConnection",
    } as AccountToApiTokensConnection;
  }
  if (obj["__typename"] == "AccountToNodesConnection") {
    return {
      count: obj["account_to_nodes_connection_count"],
      pageInfo: PageInfoFromJson(obj["account_to_nodes_connection_page_info"]),
      entities: obj["account_to_nodes_connection_entities"].map((e) =>
        LightsparkNodeFromJson(e),
      ),
      typename: "AccountToNodesConnection",
    } as AccountToNodesConnection;
  }
  if (obj["__typename"] == "AccountToPaymentRequestsConnection") {
    return {
      count: obj["account_to_payment_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_payment_requests_connection_page_info"],
      ),
      entities: obj["account_to_payment_requests_connection_entities"].map(
        (e) => PaymentRequestFromJson(e),
      ),
      typename: "AccountToPaymentRequestsConnection",
    } as AccountToPaymentRequestsConnection;
  }
  if (obj["__typename"] == "AccountToTransactionsConnection") {
    return {
      count: obj["account_to_transactions_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_transactions_connection_page_info"],
      ),
      entities: obj["account_to_transactions_connection_entities"].map((e) =>
        TransactionFromJson(e),
      ),
      typename: "AccountToTransactionsConnection",
      profitLoss: !!obj["account_to_transactions_connection_profit_loss"]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_profit_loss"],
          )
        : undefined,
      averageFeeEarned: !!obj[
        "account_to_transactions_connection_average_fee_earned"
      ]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_average_fee_earned"],
          )
        : undefined,
      totalAmountTransacted: !!obj[
        "account_to_transactions_connection_total_amount_transacted"
      ]
        ? CurrencyAmountFromJson(
            obj["account_to_transactions_connection_total_amount_transacted"],
          )
        : undefined,
    } as AccountToTransactionsConnection;
  }
  if (obj["__typename"] == "AccountToWalletsConnection") {
    return {
      count: obj["account_to_wallets_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_wallets_connection_page_info"],
      ),
      entities: obj["account_to_wallets_connection_entities"].map((e) =>
        WalletFromJson(e),
      ),
      typename: "AccountToWalletsConnection",
    } as AccountToWalletsConnection;
  }
  if (obj["__typename"] == "AccountToWithdrawalRequestsConnection") {
    return {
      count: obj["account_to_withdrawal_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["account_to_withdrawal_requests_connection_page_info"],
      ),
      entities: obj["account_to_withdrawal_requests_connection_entities"].map(
        (e) => WithdrawalRequestFromJson(e),
      ),
      typename: "AccountToWithdrawalRequestsConnection",
    } as AccountToWithdrawalRequestsConnection;
  }
  if (obj["__typename"] == "IncomingPaymentToAttemptsConnection") {
    return {
      count: obj["incoming_payment_to_attempts_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["incoming_payment_to_attempts_connection_page_info"],
      ),
      entities: obj["incoming_payment_to_attempts_connection_entities"].map(
        (e) => IncomingPaymentAttemptFromJson(e),
      ),
      typename: "IncomingPaymentToAttemptsConnection",
    } as IncomingPaymentToAttemptsConnection;
  }
  if (obj["__typename"] == "LightsparkNodeToChannelsConnection") {
    return {
      count: obj["lightspark_node_to_channels_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["lightspark_node_to_channels_connection_page_info"],
      ),
      entities: obj["lightspark_node_to_channels_connection_entities"].map(
        (e) => ChannelFromJson(e),
      ),
      typename: "LightsparkNodeToChannelsConnection",
    } as LightsparkNodeToChannelsConnection;
  }
  if (obj["__typename"] == "OutgoingPaymentAttemptToHopsConnection") {
    return {
      count: obj["outgoing_payment_attempt_to_hops_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["outgoing_payment_attempt_to_hops_connection_page_info"],
      ),
      entities: obj["outgoing_payment_attempt_to_hops_connection_entities"].map(
        (e) => HopFromJson(e),
      ),
      typename: "OutgoingPaymentAttemptToHopsConnection",
    } as OutgoingPaymentAttemptToHopsConnection;
  }
  if (obj["__typename"] == "OutgoingPaymentToAttemptsConnection") {
    return {
      count: obj["outgoing_payment_to_attempts_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["outgoing_payment_to_attempts_connection_page_info"],
      ),
      entities: obj["outgoing_payment_to_attempts_connection_entities"].map(
        (e) => OutgoingPaymentAttemptFromJson(e),
      ),
      typename: "OutgoingPaymentToAttemptsConnection",
    } as OutgoingPaymentToAttemptsConnection;
  }
  if (obj["__typename"] == "WalletToPaymentRequestsConnection") {
    return {
      count: obj["wallet_to_payment_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_payment_requests_connection_page_info"],
      ),
      entities: obj["wallet_to_payment_requests_connection_entities"].map((e) =>
        PaymentRequestFromJson(e),
      ),
      typename: "WalletToPaymentRequestsConnection",
    } as WalletToPaymentRequestsConnection;
  }
  if (obj["__typename"] == "WalletToTransactionsConnection") {
    return {
      count: obj["wallet_to_transactions_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_transactions_connection_page_info"],
      ),
      entities: obj["wallet_to_transactions_connection_entities"].map((e) =>
        TransactionFromJson(e),
      ),
      typename: "WalletToTransactionsConnection",
    } as WalletToTransactionsConnection;
  }
  if (obj["__typename"] == "WalletToWithdrawalRequestsConnection") {
    return {
      count: obj["wallet_to_withdrawal_requests_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_withdrawal_requests_connection_page_info"],
      ),
      entities: obj["wallet_to_withdrawal_requests_connection_entities"].map(
        (e) => WithdrawalRequestFromJson(e),
      ),
      typename: "WalletToWithdrawalRequestsConnection",
    } as WalletToWithdrawalRequestsConnection;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Connection corresponding to the typename=${obj["__typename"]}`,
  );
};
export const ConnectionToJson = (obj: Connection): any => {
  if (obj.typename == "AccountToApiTokensConnection") {
    const accountToApiTokensConnection = obj as AccountToApiTokensConnection;
    return {
      __typename: "AccountToApiTokensConnection",
      account_to_api_tokens_connection_count:
        accountToApiTokensConnection.count,
      account_to_api_tokens_connection_page_info: PageInfoToJson(
        accountToApiTokensConnection.pageInfo,
      ),
      account_to_api_tokens_connection_entities:
        accountToApiTokensConnection.entities.map((e) => ApiTokenToJson(e)),
    };
  }
  if (obj.typename == "AccountToNodesConnection") {
    const accountToNodesConnection = obj as AccountToNodesConnection;
    return {
      __typename: "AccountToNodesConnection",
      account_to_nodes_connection_count: accountToNodesConnection.count,
      account_to_nodes_connection_page_info: PageInfoToJson(
        accountToNodesConnection.pageInfo,
      ),
      account_to_nodes_connection_entities:
        accountToNodesConnection.entities.map((e) => LightsparkNodeToJson(e)),
    };
  }
  if (obj.typename == "AccountToPaymentRequestsConnection") {
    const accountToPaymentRequestsConnection =
      obj as AccountToPaymentRequestsConnection;
    return {
      __typename: "AccountToPaymentRequestsConnection",
      account_to_payment_requests_connection_count:
        accountToPaymentRequestsConnection.count,
      account_to_payment_requests_connection_page_info: PageInfoToJson(
        accountToPaymentRequestsConnection.pageInfo,
      ),
      account_to_payment_requests_connection_entities:
        accountToPaymentRequestsConnection.entities.map((e) =>
          PaymentRequestToJson(e),
        ),
    };
  }
  if (obj.typename == "AccountToTransactionsConnection") {
    const accountToTransactionsConnection =
      obj as AccountToTransactionsConnection;
    return {
      __typename: "AccountToTransactionsConnection",
      account_to_transactions_connection_count:
        accountToTransactionsConnection.count,
      account_to_transactions_connection_page_info: PageInfoToJson(
        accountToTransactionsConnection.pageInfo,
      ),
      account_to_transactions_connection_profit_loss:
        accountToTransactionsConnection.profitLoss
          ? CurrencyAmountToJson(accountToTransactionsConnection.profitLoss)
          : undefined,
      account_to_transactions_connection_average_fee_earned:
        accountToTransactionsConnection.averageFeeEarned
          ? CurrencyAmountToJson(
              accountToTransactionsConnection.averageFeeEarned,
            )
          : undefined,
      account_to_transactions_connection_total_amount_transacted:
        accountToTransactionsConnection.totalAmountTransacted
          ? CurrencyAmountToJson(
              accountToTransactionsConnection.totalAmountTransacted,
            )
          : undefined,
      account_to_transactions_connection_entities:
        accountToTransactionsConnection.entities.map((e) =>
          TransactionToJson(e),
        ),
    };
  }
  if (obj.typename == "AccountToWalletsConnection") {
    const accountToWalletsConnection = obj as AccountToWalletsConnection;
    return {
      __typename: "AccountToWalletsConnection",
      account_to_wallets_connection_count: accountToWalletsConnection.count,
      account_to_wallets_connection_page_info: PageInfoToJson(
        accountToWalletsConnection.pageInfo,
      ),
      account_to_wallets_connection_entities:
        accountToWalletsConnection.entities.map((e) => e.toJson()),
    };
  }
  if (obj.typename == "AccountToWithdrawalRequestsConnection") {
    const accountToWithdrawalRequestsConnection =
      obj as AccountToWithdrawalRequestsConnection;
    return {
      __typename: "AccountToWithdrawalRequestsConnection",
      account_to_withdrawal_requests_connection_count:
        accountToWithdrawalRequestsConnection.count,
      account_to_withdrawal_requests_connection_page_info: PageInfoToJson(
        accountToWithdrawalRequestsConnection.pageInfo,
      ),
      account_to_withdrawal_requests_connection_entities:
        accountToWithdrawalRequestsConnection.entities.map((e) => e.toJson()),
    };
  }
  if (obj.typename == "IncomingPaymentToAttemptsConnection") {
    const incomingPaymentToAttemptsConnection =
      obj as IncomingPaymentToAttemptsConnection;
    return {
      __typename: "IncomingPaymentToAttemptsConnection",
      incoming_payment_to_attempts_connection_count:
        incomingPaymentToAttemptsConnection.count,
      incoming_payment_to_attempts_connection_page_info: PageInfoToJson(
        incomingPaymentToAttemptsConnection.pageInfo,
      ),
      incoming_payment_to_attempts_connection_entities:
        incomingPaymentToAttemptsConnection.entities.map((e) =>
          IncomingPaymentAttemptToJson(e),
        ),
    };
  }
  if (obj.typename == "LightsparkNodeToChannelsConnection") {
    const lightsparkNodeToChannelsConnection =
      obj as LightsparkNodeToChannelsConnection;
    return {
      __typename: "LightsparkNodeToChannelsConnection",
      lightspark_node_to_channels_connection_count:
        lightsparkNodeToChannelsConnection.count,
      lightspark_node_to_channels_connection_page_info: PageInfoToJson(
        lightsparkNodeToChannelsConnection.pageInfo,
      ),
      lightspark_node_to_channels_connection_entities:
        lightsparkNodeToChannelsConnection.entities.map((e) => e.toJson()),
    };
  }
  if (obj.typename == "OutgoingPaymentAttemptToHopsConnection") {
    const outgoingPaymentAttemptToHopsConnection =
      obj as OutgoingPaymentAttemptToHopsConnection;
    return {
      __typename: "OutgoingPaymentAttemptToHopsConnection",
      outgoing_payment_attempt_to_hops_connection_count:
        outgoingPaymentAttemptToHopsConnection.count,
      outgoing_payment_attempt_to_hops_connection_page_info: PageInfoToJson(
        outgoingPaymentAttemptToHopsConnection.pageInfo,
      ),
      outgoing_payment_attempt_to_hops_connection_entities:
        outgoingPaymentAttemptToHopsConnection.entities.map((e) =>
          HopToJson(e),
        ),
    };
  }
  if (obj.typename == "OutgoingPaymentToAttemptsConnection") {
    const outgoingPaymentToAttemptsConnection =
      obj as OutgoingPaymentToAttemptsConnection;
    return {
      __typename: "OutgoingPaymentToAttemptsConnection",
      outgoing_payment_to_attempts_connection_count:
        outgoingPaymentToAttemptsConnection.count,
      outgoing_payment_to_attempts_connection_page_info: PageInfoToJson(
        outgoingPaymentToAttemptsConnection.pageInfo,
      ),
      outgoing_payment_to_attempts_connection_entities:
        outgoingPaymentToAttemptsConnection.entities.map((e) => e.toJson()),
    };
  }
  if (obj.typename == "WalletToPaymentRequestsConnection") {
    const walletToPaymentRequestsConnection =
      obj as WalletToPaymentRequestsConnection;
    return {
      __typename: "WalletToPaymentRequestsConnection",
      wallet_to_payment_requests_connection_count:
        walletToPaymentRequestsConnection.count,
      wallet_to_payment_requests_connection_page_info: PageInfoToJson(
        walletToPaymentRequestsConnection.pageInfo,
      ),
      wallet_to_payment_requests_connection_entities:
        walletToPaymentRequestsConnection.entities.map((e) =>
          PaymentRequestToJson(e),
        ),
    };
  }
  if (obj.typename == "WalletToTransactionsConnection") {
    const walletToTransactionsConnection =
      obj as WalletToTransactionsConnection;
    return {
      __typename: "WalletToTransactionsConnection",
      wallet_to_transactions_connection_count:
        walletToTransactionsConnection.count,
      wallet_to_transactions_connection_page_info: PageInfoToJson(
        walletToTransactionsConnection.pageInfo,
      ),
      wallet_to_transactions_connection_entities:
        walletToTransactionsConnection.entities.map((e) =>
          TransactionToJson(e),
        ),
    };
  }
  if (obj.typename == "WalletToWithdrawalRequestsConnection") {
    const walletToWithdrawalRequestsConnection =
      obj as WalletToWithdrawalRequestsConnection;
    return {
      __typename: "WalletToWithdrawalRequestsConnection",
      wallet_to_withdrawal_requests_connection_count:
        walletToWithdrawalRequestsConnection.count,
      wallet_to_withdrawal_requests_connection_page_info: PageInfoToJson(
        walletToWithdrawalRequestsConnection.pageInfo,
      ),
      wallet_to_withdrawal_requests_connection_entities:
        walletToWithdrawalRequestsConnection.entities.map((e) => e.toJson()),
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Connection corresponding to the typename=${obj.typename}`,
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
    ... on AccountToWithdrawalRequestsConnection {
        __typename
        account_to_withdrawal_requests_connection_count: count
        account_to_withdrawal_requests_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        account_to_withdrawal_requests_connection_entities: entities {
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
    ... on WalletToWithdrawalRequestsConnection {
        __typename
        wallet_to_withdrawal_requests_connection_count: count
        wallet_to_withdrawal_requests_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        wallet_to_withdrawal_requests_connection_entities: entities {
            id
        }
    }
}`;

export default Connection;
