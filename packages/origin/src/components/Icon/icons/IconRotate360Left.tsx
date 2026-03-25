import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRotate360Left: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="rotate-360-left">
    <path
      d="M13.5 13.5L10.75 16.25L13.5 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 16.25H12C17.6609 16.25 22.25 13.8995 22.25 11C22.25 8.10051 17.6609 5.75 12 5.75C6.33908 5.75 1.75 8.10051 1.75 11C1.75 12.8075 3.5333 14.4016 6.24789 15.346"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconRotate360Left;
