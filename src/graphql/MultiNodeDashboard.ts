import CurrencyAmount from "../objects/CurrencyAmount.js";
import LightsparkNodePurpose from "../objects/LightsparkNodePurpose.js";
import LightsparkNodeStatus from "../objects/LightsparkNodeStatus.js";
import NodeAddressType from "../objects/NodeAddressType.js";
import { Maybe } from "../utils/types.js";

export type AccountDashboard = {
  id: string;
  name: Maybe<string>;
  nodes: {
    id: string;
    color: Maybe<string>;
    displayName: string;
    purpose: Maybe<LightsparkNodePurpose>;
    publicKey: Maybe<string>;
    status: Maybe<LightsparkNodeStatus>;
    addresses: {
      count: number;
      entities: {
        address: string;
        type: NodeAddressType;
      }[];
    };
    localBalance: Maybe<CurrencyAmount>;
    remoteBalance: Maybe<CurrencyAmount>;
    blockchainBalance: {
      availableBalance: Maybe<CurrencyAmount>;
      totalBalance: Maybe<CurrencyAmount>;
    } | null;
  }[];
  blockchainBalance: Maybe<{
    l1Balance: Maybe<CurrencyAmount>;
    requiredReserve: Maybe<CurrencyAmount>;
    availableBalance: Maybe<CurrencyAmount>;
    unconfirmedBalance: Maybe<CurrencyAmount>;
  }>;
  localBalance: Maybe<CurrencyAmount>;
  remoteBalance: Maybe<CurrencyAmount>;
};

export const MultiNodeDashboard = `
  query MultiNodeDashboard(
    $network: BitcoinNetwork!,
    $nodeIds: [ID!]
  ) {
    current_account {
      id
      name
      dashboard_overview_nodes: nodes(
        bitcoin_networks: [$network]
        node_ids: $nodeIds
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
            value
            unit
            __typename
          }
          remote_balance {
            value
            unit
            __typename
          }
          blockchain_balance {
            available_balance {
              value
              unit
              __typename
            }
            total_balance {
              value
              unit
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      blockchain_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        l1_balance: total_balance {
          value
          unit
          __typename
        }
        required_reserve {
          value
          unit
          __typename
        }
        available_balance {
          value
          unit
          __typename
        }
        unconfirmed_balance {
          value
          unit
          __typename
        }
        __typename
      }
      local_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        value
        unit
        __typename
      }
      remote_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        value
        unit
        __typename
      }
    }
  }
`;
