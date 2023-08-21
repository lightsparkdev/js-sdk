// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import KeyInput, { KeyInputFromJson } from "./KeyInput.js";

type InitializeWalletInput = {
  signingPublicKey: KeyInput;
};

export const InitializeWalletInputFromJson = (
  obj: any
): InitializeWalletInput => {
  return {
    signingPublicKey: KeyInputFromJson(
      obj["initialize_wallet_input_signing_public_key"]
    ),
  } as InitializeWalletInput;
};

export default InitializeWalletInput;
