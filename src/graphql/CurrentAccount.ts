// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as AccountFragment } from "../objects/Account.js";

export const CurrentAccount = `
query CurrentAccount {
    current_account {
        ...AccountFragment
    }
}

${AccountFragment}
`;
