// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type CreateNodeWalletAddressOutput = {
  nodeId: string;

  walletAddress: string;
};

export const CreateNodeWalletAddressOutputFromJson = (
  obj: any
): CreateNodeWalletAddressOutput => {
  return {
    nodeId: obj["create_node_wallet_address_output_node"].id,
    walletAddress: obj["create_node_wallet_address_output_wallet_address"],
  } as CreateNodeWalletAddressOutput;
};

export const FRAGMENT = `
fragment CreateNodeWalletAddressOutputFragment on CreateNodeWalletAddressOutput {
    __typename
    create_node_wallet_address_output_node: node {
        id
    }
    create_node_wallet_address_output_wallet_address: wallet_address
}`;

export default CreateNodeWalletAddressOutput;
