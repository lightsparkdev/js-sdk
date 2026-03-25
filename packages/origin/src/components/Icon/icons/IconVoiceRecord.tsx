import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconVoiceRecord: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="voice-record">
    <path
      d="M2.75 8.75V11.25M6.25 3.75V16.25M9.75 6.75V13.25M13.25 4.75V8.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="16.75"
      cy="15.75"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.75" cy="15.75" r="2.75" fill="currentColor" />
  </CentralIconBase>
);

export default IconVoiceRecord;
