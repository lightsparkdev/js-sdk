import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconChevronBottom: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="chevron-bottom">
    <path
      d="M20 9L12 17L4 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconChevronBottom;
