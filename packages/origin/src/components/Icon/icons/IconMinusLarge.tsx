import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconMinusLarge: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="minus-large, remove, delete">
    <path
      d="M3.75 12H20.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconMinusLarge;
