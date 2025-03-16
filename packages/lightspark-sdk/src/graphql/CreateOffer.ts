// Copyright ©, 2025-present, Lightspark Group, Inc. - All Rights Reserved

export const CreateOffer = `
  mutation CreateOffer(
    $node_id: ID!
    $amount_msats: Long
    $description: String
  ) {
    create_offer(input: { node_id: $node_id, amount_msats: $amount_msats, description: $description }) {
      offer {
        encoded_offer
      }
    }
  }
`;
