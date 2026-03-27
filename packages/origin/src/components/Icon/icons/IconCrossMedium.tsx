import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCrossMedium: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="cross-medium, crossed medium, close">
    <path
      d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconCrossMedium;
