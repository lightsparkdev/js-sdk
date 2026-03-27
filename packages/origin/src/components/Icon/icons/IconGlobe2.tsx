import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconGlobe2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="globe-2, network, translate">
    <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
    <ellipse
      cx="12"
      cy="12"
      rx="3.5"
      ry="9.25"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M3.5 9.25H20.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 14.75H20.5" stroke="currentColor" strokeWidth="1.5" />
  </CentralIconBase>
);

export default IconGlobe2;
