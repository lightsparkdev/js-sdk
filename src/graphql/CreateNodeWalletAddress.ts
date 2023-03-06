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
