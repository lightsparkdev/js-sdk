import { gql } from "@apollo/client/core";

export const RecoverNodeSigningKey = gql`
  query RecoverNodeSigningKey($nodeId: ID!) {
    entity(id: $nodeId) {
      ... on LightsparkNode {
        encrypted_signing_private_key {
          encrypted_value
          cipher
        }
      }
    }
  }
`;
