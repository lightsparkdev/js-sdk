import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconChevronTopSmall: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="chevron-top-small">
    <path
      d="M8 14L12 10L16 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconChevronTopSmall;
