import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowRight: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrow-right">
    <path
      d="M14 5.75L20.25 12L14 18.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 12H3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowRight;
