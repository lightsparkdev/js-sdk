// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type CreateNodeWalletAddressInput = {
  nodeId: string;
};

export const CreateNodeWalletAddressInputFromJson = (
  obj: any
): CreateNodeWalletAddressInput => {
  return {
    nodeId: obj["create_node_wallet_address_input_node_id"],
  } as CreateNodeWalletAddressInput;
};

export default CreateNodeWalletAddressInput;
