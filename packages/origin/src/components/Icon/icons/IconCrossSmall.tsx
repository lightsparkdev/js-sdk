import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCrossSmall: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="cross-small, crossed small, delete, remove"
  >
    <path
      d="M7.75 7.75L16.25 16.25M16.25 7.75L7.75 16.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconCrossSmall;
