// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateNodeWalletAddressInput {
  nodeId: string;
}

export const CreateNodeWalletAddressInputFromJson = (
  obj: any,
): CreateNodeWalletAddressInput => {
  return {
    nodeId: obj["create_node_wallet_address_input_node_id"],
  } as CreateNodeWalletAddressInput;
};
export const CreateNodeWalletAddressInputToJson = (
  obj: CreateNodeWalletAddressInput,
): any => {
  return {
    create_node_wallet_address_input_node_id: obj.nodeId,
  };
};

export default CreateNodeWalletAddressInput;
