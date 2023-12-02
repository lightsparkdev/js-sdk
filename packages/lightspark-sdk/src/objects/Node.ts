// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type LightsparkClient from "../client.js";
import { BalancesFromJson, BalancesToJson } from "./Balances.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import {
  BlockchainBalanceFromJson,
  BlockchainBalanceToJson,
} from "./BlockchainBalance.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import GraphNode from "./GraphNode.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import LightsparkNodeWithOSK from "./LightsparkNodeWithOSK.js";
import LightsparkNodeWithRemoteSigning from "./LightsparkNodeWithRemoteSigning.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { SecretFromJson, SecretToJson } from "./Secret.js";

/**
 * This object is an interface representing a Lightning Node on the Lightning Network, and could
 * either be a Lightspark node or a node managed by a third party. *
 */
interface Node {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The Bitcoin Network this node is deployed in. **/
  bitcoinNetwork: BitcoinNetwork;

  /**
   * The name of this node in the network. It will be the most human-readable option possible,
   * depending on the data available for this node.
   **/
  displayName: string;

  /** The typename of the object **/
  typename: string;

  /**
   * A name that identifies the node. It has no importance in terms of operating the node, it is
   * just a way to identify and search for commercial services or popular nodes. This alias can
   * be changed at any time by the node operator.
   **/
  alias?: string | undefined;

  /**
   * A hexadecimal string that describes a color. For example "#000000" is black, "#FFFFFF" is
   * white. It has no importance in terms of operating the node, it is just a way to visually
   * differentiate nodes. That color can be changed at any time by the node operator.
   **/
  color?: string | undefined;

  /**
   * A summary metric used to capture how well positioned a node is to send, receive, or route
   * transactions efficiently. Maximizing a node's conductivity helps a node’s transactions to be
   * capital efficient. The value is an integer ranging between 0 and 10 (bounds included).
   **/
  conductivity?: number | undefined;

  /**
   * The public key of this node. It acts as a unique identifier of this node in the Lightning
   * Network. *
   */
  publicKey?: string | undefined;

  getAddresses(
    client: LightsparkClient,
    first?: number | undefined,
    types?: NodeAddressType[] | undefined,
  ): Promise<NodeToAddressesConnection>;
}

export const NodeFromJson = (obj: any): Node => {
  if (obj["__typename"] == "GraphNode") {
    return new GraphNode(
      obj["graph_node_id"],
      obj["graph_node_created_at"],
      obj["graph_node_updated_at"],
      BitcoinNetwork[obj["graph_node_bitcoin_network"]] ??
        BitcoinNetwork.FUTURE_VALUE,
      obj["graph_node_display_name"],
      "GraphNode",
      obj["graph_node_alias"],
      obj["graph_node_color"],
      obj["graph_node_conductivity"],
      obj["graph_node_public_key"],
    );
  }
  if (obj["__typename"] == "LightsparkNodeWithOSK") {
    return new LightsparkNodeWithOSK(
      obj["lightspark_node_with_o_s_k_id"],
      obj["lightspark_node_with_o_s_k_created_at"],
      obj["lightspark_node_with_o_s_k_updated_at"],
      BitcoinNetwork[obj["lightspark_node_with_o_s_k_bitcoin_network"]] ??
        BitcoinNetwork.FUTURE_VALUE,
      obj["lightspark_node_with_o_s_k_display_name"],
      obj["lightspark_node_with_o_s_k_owner"].id,
      obj["lightspark_node_with_o_s_k_uma_prescreening_utxos"],
      "LightsparkNodeWithOSK",
      obj["lightspark_node_with_o_s_k_alias"],
      obj["lightspark_node_with_o_s_k_color"],
      obj["lightspark_node_with_o_s_k_conductivity"],
      obj["lightspark_node_with_o_s_k_public_key"],
      !!obj["lightspark_node_with_o_s_k_status"]
        ? LightsparkNodeStatus[obj["lightspark_node_with_o_s_k_status"]] ??
          LightsparkNodeStatus.FUTURE_VALUE
        : null,
      !!obj["lightspark_node_with_o_s_k_total_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_o_s_k_total_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_o_s_k_total_local_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_o_s_k_total_local_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_o_s_k_local_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_o_s_k_local_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_o_s_k_remote_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_o_s_k_remote_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_o_s_k_blockchain_balance"]
        ? BlockchainBalanceFromJson(
            obj["lightspark_node_with_o_s_k_blockchain_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_o_s_k_balances"]
        ? BalancesFromJson(obj["lightspark_node_with_o_s_k_balances"])
        : undefined,
      !!obj["lightspark_node_with_o_s_k_encrypted_signing_private_key"]
        ? SecretFromJson(
            obj["lightspark_node_with_o_s_k_encrypted_signing_private_key"],
          )
        : undefined,
    );
  }
  if (obj["__typename"] == "LightsparkNodeWithRemoteSigning") {
    return new LightsparkNodeWithRemoteSigning(
      obj["lightspark_node_with_remote_signing_id"],
      obj["lightspark_node_with_remote_signing_created_at"],
      obj["lightspark_node_with_remote_signing_updated_at"],
      BitcoinNetwork[
        obj["lightspark_node_with_remote_signing_bitcoin_network"]
      ] ?? BitcoinNetwork.FUTURE_VALUE,
      obj["lightspark_node_with_remote_signing_display_name"],
      obj["lightspark_node_with_remote_signing_owner"].id,
      obj["lightspark_node_with_remote_signing_uma_prescreening_utxos"],
      "LightsparkNodeWithRemoteSigning",
      obj["lightspark_node_with_remote_signing_alias"],
      obj["lightspark_node_with_remote_signing_color"],
      obj["lightspark_node_with_remote_signing_conductivity"],
      obj["lightspark_node_with_remote_signing_public_key"],
      !!obj["lightspark_node_with_remote_signing_status"]
        ? LightsparkNodeStatus[
            obj["lightspark_node_with_remote_signing_status"]
          ] ?? LightsparkNodeStatus.FUTURE_VALUE
        : null,
      !!obj["lightspark_node_with_remote_signing_total_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_remote_signing_total_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_remote_signing_total_local_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_remote_signing_total_local_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_remote_signing_local_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_remote_signing_local_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_remote_signing_remote_balance"]
        ? CurrencyAmountFromJson(
            obj["lightspark_node_with_remote_signing_remote_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_remote_signing_blockchain_balance"]
        ? BlockchainBalanceFromJson(
            obj["lightspark_node_with_remote_signing_blockchain_balance"],
          )
        : undefined,
      !!obj["lightspark_node_with_remote_signing_balances"]
        ? BalancesFromJson(obj["lightspark_node_with_remote_signing_balances"])
        : undefined,
    );
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj["__typename"]}`,
  );
};
export const NodeToJson = (obj: Node): any => {
  if (obj.typename == "GraphNode") {
    const graphNode = obj as GraphNode;
    return {
      __typename: "GraphNode",
      graph_node_id: graphNode.id,
      graph_node_created_at: graphNode.createdAt,
      graph_node_updated_at: graphNode.updatedAt,
      graph_node_alias: graphNode.alias,
      graph_node_bitcoin_network: graphNode.bitcoinNetwork,
      graph_node_color: graphNode.color,
      graph_node_conductivity: graphNode.conductivity,
      graph_node_display_name: graphNode.displayName,
      graph_node_public_key: graphNode.publicKey,
    };
  }
  if (obj.typename == "LightsparkNodeWithOSK") {
    const lightsparkNodeWithOSK = obj as LightsparkNodeWithOSK;
    return {
      __typename: "LightsparkNodeWithOSK",
      lightspark_node_with_o_s_k_id: lightsparkNodeWithOSK.id,
      lightspark_node_with_o_s_k_created_at: lightsparkNodeWithOSK.createdAt,
      lightspark_node_with_o_s_k_updated_at: lightsparkNodeWithOSK.updatedAt,
      lightspark_node_with_o_s_k_alias: lightsparkNodeWithOSK.alias,
      lightspark_node_with_o_s_k_bitcoin_network:
        lightsparkNodeWithOSK.bitcoinNetwork,
      lightspark_node_with_o_s_k_color: lightsparkNodeWithOSK.color,
      lightspark_node_with_o_s_k_conductivity:
        lightsparkNodeWithOSK.conductivity,
      lightspark_node_with_o_s_k_display_name:
        lightsparkNodeWithOSK.displayName,
      lightspark_node_with_o_s_k_public_key: lightsparkNodeWithOSK.publicKey,
      lightspark_node_with_o_s_k_owner: { id: lightsparkNodeWithOSK.ownerId },
      lightspark_node_with_o_s_k_status: lightsparkNodeWithOSK.status,
      lightspark_node_with_o_s_k_total_balance:
        lightsparkNodeWithOSK.totalBalance
          ? CurrencyAmountToJson(lightsparkNodeWithOSK.totalBalance)
          : undefined,
      lightspark_node_with_o_s_k_total_local_balance:
        lightsparkNodeWithOSK.totalLocalBalance
          ? CurrencyAmountToJson(lightsparkNodeWithOSK.totalLocalBalance)
          : undefined,
      lightspark_node_with_o_s_k_local_balance:
        lightsparkNodeWithOSK.localBalance
          ? CurrencyAmountToJson(lightsparkNodeWithOSK.localBalance)
          : undefined,
      lightspark_node_with_o_s_k_remote_balance:
        lightsparkNodeWithOSK.remoteBalance
          ? CurrencyAmountToJson(lightsparkNodeWithOSK.remoteBalance)
          : undefined,
      lightspark_node_with_o_s_k_blockchain_balance:
        lightsparkNodeWithOSK.blockchainBalance
          ? BlockchainBalanceToJson(lightsparkNodeWithOSK.blockchainBalance)
          : undefined,
      lightspark_node_with_o_s_k_uma_prescreening_utxos:
        lightsparkNodeWithOSK.umaPrescreeningUtxos,
      lightspark_node_with_o_s_k_balances: lightsparkNodeWithOSK.balances
        ? BalancesToJson(lightsparkNodeWithOSK.balances)
        : undefined,
      lightspark_node_with_o_s_k_encrypted_signing_private_key:
        lightsparkNodeWithOSK.encryptedSigningPrivateKey
          ? SecretToJson(lightsparkNodeWithOSK.encryptedSigningPrivateKey)
          : undefined,
    };
  }
  if (obj.typename == "LightsparkNodeWithRemoteSigning") {
    const lightsparkNodeWithRemoteSigning =
      obj as LightsparkNodeWithRemoteSigning;
    return {
      __typename: "LightsparkNodeWithRemoteSigning",
      lightspark_node_with_remote_signing_id:
        lightsparkNodeWithRemoteSigning.id,
      lightspark_node_with_remote_signing_created_at:
        lightsparkNodeWithRemoteSigning.createdAt,
      lightspark_node_with_remote_signing_updated_at:
        lightsparkNodeWithRemoteSigning.updatedAt,
      lightspark_node_with_remote_signing_alias:
        lightsparkNodeWithRemoteSigning.alias,
      lightspark_node_with_remote_signing_bitcoin_network:
        lightsparkNodeWithRemoteSigning.bitcoinNetwork,
      lightspark_node_with_remote_signing_color:
        lightsparkNodeWithRemoteSigning.color,
      lightspark_node_with_remote_signing_conductivity:
        lightsparkNodeWithRemoteSigning.conductivity,
      lightspark_node_with_remote_signing_display_name:
        lightsparkNodeWithRemoteSigning.displayName,
      lightspark_node_with_remote_signing_public_key:
        lightsparkNodeWithRemoteSigning.publicKey,
      lightspark_node_with_remote_signing_owner: {
        id: lightsparkNodeWithRemoteSigning.ownerId,
      },
      lightspark_node_with_remote_signing_status:
        lightsparkNodeWithRemoteSigning.status,
      lightspark_node_with_remote_signing_total_balance:
        lightsparkNodeWithRemoteSigning.totalBalance
          ? CurrencyAmountToJson(lightsparkNodeWithRemoteSigning.totalBalance)
          : undefined,
      lightspark_node_with_remote_signing_total_local_balance:
        lightsparkNodeWithRemoteSigning.totalLocalBalance
          ? CurrencyAmountToJson(
              lightsparkNodeWithRemoteSigning.totalLocalBalance,
            )
          : undefined,
      lightspark_node_with_remote_signing_local_balance:
        lightsparkNodeWithRemoteSigning.localBalance
          ? CurrencyAmountToJson(lightsparkNodeWithRemoteSigning.localBalance)
          : undefined,
      lightspark_node_with_remote_signing_remote_balance:
        lightsparkNodeWithRemoteSigning.remoteBalance
          ? CurrencyAmountToJson(lightsparkNodeWithRemoteSigning.remoteBalance)
          : undefined,
      lightspark_node_with_remote_signing_blockchain_balance:
        lightsparkNodeWithRemoteSigning.blockchainBalance
          ? BlockchainBalanceToJson(
              lightsparkNodeWithRemoteSigning.blockchainBalance,
            )
          : undefined,
      lightspark_node_with_remote_signing_uma_prescreening_utxos:
        lightsparkNodeWithRemoteSigning.umaPrescreeningUtxos,
      lightspark_node_with_remote_signing_balances:
        lightsparkNodeWithRemoteSigning.balances
          ? BalancesToJson(lightsparkNodeWithRemoteSigning.balances)
          : undefined,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj.typename}`,
  );
};

export const FRAGMENT = `
fragment NodeFragment on Node {
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
}`;

export const getNodeQuery = (id: string): Query<Node> => {
  return {
    queryPayload: `
query GetNode($id: ID!) {
    entity(id: $id) {
        ... on Node {
            ...NodeFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => NodeFromJson(data.entity),
  };
};

export default Node;
