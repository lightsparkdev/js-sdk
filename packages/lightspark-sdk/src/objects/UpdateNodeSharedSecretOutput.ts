// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type UpdateNodeSharedSecretOutput = {
  nodeId: string;
};

export const UpdateNodeSharedSecretOutputFromJson = (
  obj: any,
): UpdateNodeSharedSecretOutput => {
  return {
    nodeId: obj["update_node_shared_secret_output_node"].id,
  } as UpdateNodeSharedSecretOutput;
};

export const FRAGMENT = `
fragment UpdateNodeSharedSecretOutputFragment on UpdateNodeSharedSecretOutput {
    __typename
    update_node_shared_secret_output_node: node {
        id
    }
}`;

export default UpdateNodeSharedSecretOutput;
