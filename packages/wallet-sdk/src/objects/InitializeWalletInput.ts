// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type KeyInput from "./KeyInput.js";
import { KeyInputFromJson, KeyInputToJson } from "./KeyInput.js";

interface InitializeWalletInput {
  signingPublicKey: KeyInput;
}

export const InitializeWalletInputFromJson = (
  obj: any,
): InitializeWalletInput => {
  return {
    signingPublicKey: KeyInputFromJson(
      obj["initialize_wallet_input_signing_public_key"],
    ),
  } as InitializeWalletInput;
};
export const InitializeWalletInputToJson = (
  obj: InitializeWalletInput,
): any => {
  return {
    initialize_wallet_input_signing_public_key: KeyInputToJson(
      obj.signingPublicKey,
    ),
  };
};

export default InitializeWalletInput;
