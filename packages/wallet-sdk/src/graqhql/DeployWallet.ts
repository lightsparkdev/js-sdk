// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as DeployWalletOutputFragment } from "../objects/DeployWalletOutput.js";

const DeployWallet = `
  mutation DeployWallet {
    deploy_wallet {
      ...DeployWalletOutputFragment
    }
  }
  
  ${DeployWalletOutputFragment}
`;

export default DeployWallet;
