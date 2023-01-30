import { gql } from "@apollo/client/core";

export const RecoverNodeSigningKey = gql`
  query RecoverNodeSigningKey($node_id: ID!) {
    entity(id: $node_id) {
      ... on LightsparkNode {
        encrypted_signing_private_key {
          encrypted_value
          cipher
        }
      }
    }
  }
`;
