import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconMinusSmall: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="minus-small, remove, delete">
    <path
      d="M6.75 12H17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconMinusSmall;
