import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconTimeFlies: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="time-flies, speed">
    <circle
      cx="15"
      cy="12"
      r="7.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.75 12H4.25M2.75 16.25H5.25M2.75 7.75H5.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8.75V12L17 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconTimeFlies;
