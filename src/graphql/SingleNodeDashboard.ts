import CurrencyAmount, {
  FRAGMENT as CurrencyAmountFragment,
} from "../objects/CurrencyAmount.js";
import LightsparkNodePurpose from "../objects/LightsparkNodePurpose.js";
import LightsparkNodeStatus from "../objects/LightsparkNodeStatus.js";
import NodeAddressType from "../objects/NodeAddressType.js";
import Transaction, {
  FRAGMENT as TransactionFragment,
} from "../objects/Transaction.js";
import { Maybe } from "../utils/types.js";

export type WalletDashboard = {
  id: string;
  displayName: string;
  purpose: Maybe<LightsparkNodePurpose>;
  color: Maybe<string>;
  publicKey: Maybe<string>;
  status: Maybe<LightsparkNodeStatus>;
  addresses: {
    address: string;
    type: NodeAddressType;
  }[];
  localBalance: Maybe<CurrencyAmount>;
  remoteBalance: Maybe<CurrencyAmount>;
  blockchainBalance: {
    availableBalance: Maybe<CurrencyAmount>;
    totalBalance: Maybe<CurrencyAmount>;
  } | null;
  recentTransactions: Transaction[];
};

export const SingleNodeDashboard = `
query SingleNodeDashboard(
    $network: BitcoinNetwork!,
    $nodeId: ID!,
    $numTransactions: Int,
    $transactionsAfterDate: DateTime,
    $transactionTypes: [TransactionType!] = [PAYMENT, PAYMENT_REQUEST, ROUTE, L1_WITHDRAW, L1_DEPOSIT]
    $transaction_statuses: [TransactionStatus!] = null
) {
    current_account {
        id
        name
        dashboard_overview_nodes: nodes(
            first: 1
            bitcoin_networks: [$network]
            node_ids: [$nodeId]
        ) {
            count
            entities {
                color
                display_name
                purpose
                id
                addresses(first: 1) {
                    entities {
                        address
                        type
                        __typename
                    }
                    count
                    __typename
                }
                public_key
                status
                local_balance {
                    ...CurrencyAmountFragment
                }
                remote_balance {
                    ...CurrencyAmountFragment
                }
                blockchain_balance {
                    available_balance {
                        ...CurrencyAmountFragment
                    }
                    total_balance {
                        ...CurrencyAmountFragment
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        blockchain_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            l1_balance: total_balance {
                ...CurrencyAmountFragment
            }
            required_reserve {
                ...CurrencyAmountFragment
            }
            available_balance {
                ...CurrencyAmountFragment
            }
            unconfirmed_balance {
                ...CurrencyAmountFragment
            }
            __typename
        }
        local_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            ...CurrencyAmountFragment
        }
        remote_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            ...CurrencyAmountFragment
        }
        recent_transactions: transactions(
            first: $numTransactions
            types: $transactionTypes
            bitcoin_network: $network
            lightning_node_id: $nodeId
            statuses: $transaction_statuses
            after_date: $transactionsAfterDate
        ) {
            count
            total_amount_transacted {
                ...CurrencyAmountFragment
            }
            entities {
                ...TransactionFragment
                __typename
            }
            __typename
        }
        __typename
    }
}

${TransactionFragment}
${CurrencyAmountFragment}
`;
