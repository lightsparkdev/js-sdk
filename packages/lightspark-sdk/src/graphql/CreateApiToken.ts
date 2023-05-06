// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as ApiTokenFragment } from "../objects/ApiToken.js";

export const CreateApiToken = `
    mutation CreateApiToken(
        $name: String!
        $permissions: [Permission!]!
    ) {
        create_api_token(input: {
            name: $name
            permissions: $permissions
        }) {
            api_token {
                ...ApiTokenFragment
            }
            client_secret
        }
    }

${ApiTokenFragment}
`;
