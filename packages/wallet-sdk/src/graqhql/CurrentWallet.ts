// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as WalletFragment } from "../objects/Wallet.js";

const CurrentWalletQuery = `
query CurrentWallet {
    current_wallet {
        ...WalletFragment
    }
}

${WalletFragment}
`;

export default CurrentWalletQuery;
