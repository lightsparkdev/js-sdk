import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCrossLarge: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="cross-large, crossed large, close">
    <path
      d="M4.75 4.75L19.25 19.25M19.25 4.75L4.75 19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconCrossLarge;
