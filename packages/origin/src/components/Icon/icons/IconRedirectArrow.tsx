import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRedirectArrow: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="redirect-arrow">
    <path
      d="M12 20.25V7.875C12 5.59683 10.1532 3.75 7.875 3.75C5.59683 3.75 3.75 5.59683 3.75 7.875C3.75 10.1532 5.59683 12 7.875 12H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.75 8.5L20.25 12L16.75 15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconRedirectArrow;
