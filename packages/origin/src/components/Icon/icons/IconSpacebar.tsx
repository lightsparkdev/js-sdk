import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconSpacebar: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="spacebar">
    <path
      d="M2.75 13.75V16.25C2.75 17.9069 4.09315 19.25 5.75 19.25H18.25C19.9069 19.25 21.25 17.9069 21.25 16.25V13.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconSpacebar;
