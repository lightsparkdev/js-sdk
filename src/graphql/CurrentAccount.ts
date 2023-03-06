import { FRAGMENT as AccountFragment } from "../objects/Account.js";

export const CurrentAccount = `
query CurrentAccount {
    current_account {
        ...AccountFragment
    }
}

${AccountFragment}
`;
