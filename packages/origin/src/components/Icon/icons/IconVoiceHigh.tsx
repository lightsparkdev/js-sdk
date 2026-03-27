import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconVoiceHigh: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="voice-high, wave">
    <path
      d="M7.75 3.75V20.25M3.75 9.75V14.25M12 7.75V16.25M16.25 5.75V18.25M20.25 9.75V14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconVoiceHigh;
