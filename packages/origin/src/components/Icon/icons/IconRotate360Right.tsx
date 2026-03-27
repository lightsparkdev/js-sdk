import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRotate360Right: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="rotate-360-right">
    <path
      d="M10.5 13.5L13.25 16.25L10.5 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 16.25H12C6.33908 16.25 1.75 13.8995 1.75 11C1.75 8.10051 6.33908 5.75 12 5.75C17.6609 5.75 22.25 8.10051 22.25 11C22.25 12.8075 20.4667 14.4016 17.7521 15.346"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconRotate360Right;
