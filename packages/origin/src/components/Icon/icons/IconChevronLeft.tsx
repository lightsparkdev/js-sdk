import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconChevronLeft: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="chevron-left">
    <path
      d="M15 20L7 12L15 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconChevronLeft;
