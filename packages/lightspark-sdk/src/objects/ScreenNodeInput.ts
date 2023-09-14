// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import ComplianceProvider from "./ComplianceProvider.js";

type ScreenNodeInput = {
  provider: ComplianceProvider;

  nodePubkey: string;
};

export const ScreenNodeInputFromJson = (obj: any): ScreenNodeInput => {
  return {
    provider:
      ComplianceProvider[obj["screen_node_input_provider"]] ??
      ComplianceProvider.FUTURE_VALUE,
    nodePubkey: obj["screen_node_input_node_pubkey"],
  } as ScreenNodeInput;
};

export default ScreenNodeInput;
