// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as TerminateWalletOutputFragment } from "../objects/TerminateWalletOutput.js";

const TerminateWallet = `
  mutation TerminateWallet {
    terminate_wallet {
      ...TerminateWalletOutputFragment
    }
  }
  
    ${TerminateWalletOutputFragment}
`;

export default TerminateWallet;
