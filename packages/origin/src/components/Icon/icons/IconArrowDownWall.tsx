import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowDownWall: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrow-down-wall">
    <path
      d="M19.25 3.75L4.75 3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16.5 15.75L12 20.25L7.5 15.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7.75V19.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowDownWall;
