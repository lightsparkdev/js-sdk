import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconFilter2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="filter-2, sort">
    <path
      d="M2.75 4.75H21.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8.75 19.25H15.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5.75 12H18.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconFilter2;
