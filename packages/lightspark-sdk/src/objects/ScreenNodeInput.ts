// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import ComplianceProvider from "./ComplianceProvider.js";

interface ScreenNodeInput {
  /**
   * The compliance provider that is going to screen the node. You need to be a customer of the
   * selected provider and store the API key on the Lightspark account setting page.
   **/
  provider: ComplianceProvider;

  /** The public key of the lightning node that needs to be screened. **/
  nodePubkey: string;
}

export const ScreenNodeInputFromJson = (obj: any): ScreenNodeInput => {
  return {
    provider:
      ComplianceProvider[obj["screen_node_input_provider"]] ??
      ComplianceProvider.FUTURE_VALUE,
    nodePubkey: obj["screen_node_input_node_pubkey"],
  } as ScreenNodeInput;
};
export const ScreenNodeInputToJson = (obj: ScreenNodeInput): any => {
  return {
    screen_node_input_provider: obj.provider,
    screen_node_input_node_pubkey: obj.nodePubkey,
  };
};

export default ScreenNodeInput;
