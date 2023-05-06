// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const CreateNodeWalletAddress = `
  mutation CreateNodeWalletAddress(
    $node_id: ID!
  ) {
    create_node_wallet_address(input: {
        node_id: $node_id
    }) {
        wallet_address
    }
  }
`;
