// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type UpdateNodeSharedSecretInput = {
  nodeId: string;

  sharedSecret: string;
};

export const UpdateNodeSharedSecretInputFromJson = (
  obj: any,
): UpdateNodeSharedSecretInput => {
  return {
    nodeId: obj["update_node_shared_secret_input_node_id"],
    sharedSecret: obj["update_node_shared_secret_input_shared_secret"],
  } as UpdateNodeSharedSecretInput;
};

export default UpdateNodeSharedSecretInput;
