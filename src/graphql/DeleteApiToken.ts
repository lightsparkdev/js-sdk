export const DeleteApiToken = `
    mutation DeleteApiToken(
        $api_token_id: ID!
    ) {
        delete_api_token(input: {
            api_token_id: $api_token_id
        }) {
            __typename
        }
    }
`;
