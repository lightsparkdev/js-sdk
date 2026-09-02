import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowCornerDownLeft: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrow-corner-down-left">
    <path
      d="M20.25 4.75V15.25H4.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 11.25L3.75 15.25L7.75 19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowCornerDownLeft;
