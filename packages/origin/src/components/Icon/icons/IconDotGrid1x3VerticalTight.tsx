import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconDotGrid1x3VerticalTight: FC<CentralIconBaseProps> = (
  props,
) => (
  <CentralIconBase
    {...props}
    ariaLabel="dot-grid-1x3-vertical-tight, menu, drag, grab"
  >
    <rect x="10" y="3" width="4" height="4" rx="2" fill="currentColor" />
    <rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor" />
    <rect x="10" y="17" width="4" height="4" rx="2" fill="currentColor" />
  </CentralIconBase>
);

export default IconDotGrid1x3VerticalTight;
