import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconChevronTop: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="chevron-top">
    <path
      d="M4 15L12 7L20 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconChevronTop;
