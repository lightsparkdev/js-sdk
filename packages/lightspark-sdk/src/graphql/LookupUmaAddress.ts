// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const LookupUmaAddress = `
    query LookupUmaAddress(
        $uma_address: String!
    ) {
        lookup_uma_address(input: { uma_address: $uma_address })
    }
`;
