import { CounterPartyDataOptions } from "@uma-sdk/core";

export const PAYER_DATA_OPTIONS: CounterPartyDataOptions = {
  identifier: { mandatory: true },
  name: { mandatory: false },
  email: { mandatory: false },
  compliance: { mandatory: true },
};
