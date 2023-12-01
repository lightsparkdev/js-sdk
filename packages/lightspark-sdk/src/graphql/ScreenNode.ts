// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const ScreenNode = `
mutation ScreenNode(
  $provider: ComplianceProvider!
  $node_pubkey: String!
) {
  screen_node(input: {
      provider: $provider
      node_pubkey: $node_pubkey
  }) {
      rating
  }
}
`;
