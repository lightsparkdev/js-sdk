import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconChevronRight: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="chevron-right">
    <path
      d="M9 4L17 12L9 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconChevronRight;
