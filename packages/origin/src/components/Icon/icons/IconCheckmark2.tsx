import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCheckmark2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="checkmark-2">
    <path
      d="M2.75 15.0938L9 20.25L21.25 3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconCheckmark2;
