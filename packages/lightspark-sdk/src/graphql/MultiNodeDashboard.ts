// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { Maybe } from "@lightsparkdev/core";
import type CurrencyAmount from "../objects/CurrencyAmount.js";
import { FRAGMENT as CurrencyAmountFragment } from "../objects/CurrencyAmount.js";
import type LightsparkNodeStatus from "../objects/LightsparkNodeStatus.js";
import type NodeAddressType from "../objects/NodeAddressType.js";

export type AccountDashboard = {
  id: string;
  name: Maybe<string>;
  nodes: {
    id: string;
    color: Maybe<string>;
    displayName: string;
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
      blockchain_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
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
      local_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        ...CurrencyAmountFragment
      }
      remote_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        ...CurrencyAmountFragment
      }
    }
  }

  ${CurrencyAmountFragment}
`;
