import { FRAGMENT as ApiTokenFragment } from "../objects/ApiToken.js";

export const CreateApiToken = `
    mutation CreateApiToken(
        $name: String!
    ) {
        create_api_token(input: { name: $name }) {
            api_token {
                ...ApiTokenFragment
            }
            client_secret
        }
    }

${ApiTokenFragment}
`;
