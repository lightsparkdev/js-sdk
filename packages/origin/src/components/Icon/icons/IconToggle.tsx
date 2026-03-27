import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconToggle: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="toggle, settings, control">
    <rect
      x="1.25"
      y="4.75"
      width="21.5"
      height="14.5"
      rx="7.25"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8.5" cy="12" r="3" fill="currentColor" />
  </CentralIconBase>
);

export default IconToggle;
