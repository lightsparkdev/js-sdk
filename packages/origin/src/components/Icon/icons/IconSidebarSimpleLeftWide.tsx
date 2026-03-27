import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconSidebarSimpleLeftWide: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="sidebar-simple-left-wide">
    <path
      d="M2.75 7.75C2.75 6.09315 4.09315 4.75 5.75 4.75H18.25C19.9069 4.75 21.25 6.09315 21.25 7.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V7.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 5V12V19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconSidebarSimpleLeftWide;
