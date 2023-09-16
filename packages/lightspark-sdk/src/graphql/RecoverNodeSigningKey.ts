// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const RecoverNodeSigningKey = `
  query RecoverNodeSigningKey($nodeId: ID!) {
    entity(id: $nodeId) {
      __typename
      ... on LightsparkNodeWithOSK {
        encrypted_signing_private_key {
          encrypted_value
          cipher
        }
      }
    }
  }
`;
