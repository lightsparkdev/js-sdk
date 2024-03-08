// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type MultiSigAddressValidationParameters from "./MultiSigAddressValidationParameters.js";
import {
  MultiSigAddressValidationParametersFromJson,
  MultiSigAddressValidationParametersToJson,
} from "./MultiSigAddressValidationParameters.js";

interface CreateNodeWalletAddressOutput {
  nodeId: string;

  walletAddress: string;

  /**
   * Vaildation parameters for the 2-of-2 multisig address. None if the address is not a 2-of-2
   * multisig address.
   **/
  multisigWalletAddressValidationParameters?:
    | MultiSigAddressValidationParameters
    | undefined;
}

export const CreateNodeWalletAddressOutputFromJson = (
  obj: any,
): CreateNodeWalletAddressOutput => {
  return {
    nodeId: obj["create_node_wallet_address_output_node"].id,
    walletAddress: obj["create_node_wallet_address_output_wallet_address"],
    multisigWalletAddressValidationParameters: !!obj[
      "create_node_wallet_address_output_multisig_wallet_address_validation_parameters"
    ]
      ? MultiSigAddressValidationParametersFromJson(
          obj[
            "create_node_wallet_address_output_multisig_wallet_address_validation_parameters"
          ],
        )
      : undefined,
  } as CreateNodeWalletAddressOutput;
};
export const CreateNodeWalletAddressOutputToJson = (
  obj: CreateNodeWalletAddressOutput,
): any => {
  return {
    create_node_wallet_address_output_node: { id: obj.nodeId },
    create_node_wallet_address_output_wallet_address: obj.walletAddress,
    create_node_wallet_address_output_multisig_wallet_address_validation_parameters:
      obj.multisigWalletAddressValidationParameters
        ? MultiSigAddressValidationParametersToJson(
            obj.multisigWalletAddressValidationParameters,
          )
        : undefined,
  };
};

export const FRAGMENT = `
fragment CreateNodeWalletAddressOutputFragment on CreateNodeWalletAddressOutput {
    __typename
    create_node_wallet_address_output_node: node {
        id
    }
    create_node_wallet_address_output_wallet_address: wallet_address
    create_node_wallet_address_output_multisig_wallet_address_validation_parameters: multisig_wallet_address_validation_parameters {
        __typename
        multi_sig_address_validation_parameters_counterparty_funding_pubkey: counterparty_funding_pubkey
        multi_sig_address_validation_parameters_funding_pubkey_derivation_path: funding_pubkey_derivation_path
    }
}`;

export default CreateNodeWalletAddressOutput;
