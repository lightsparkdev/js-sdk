import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconShield: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="shield, security, protection">
    <path
      d="M20.25 6.94153C20.25 6.08067 19.6991 5.31639 18.8825 5.04417L12.9487 3.06624C12.3329 2.86098 11.6671 2.86098 11.0513 3.06624L5.11754 5.04417C4.30086 5.31639 3.75 6.08067 3.75 6.94153V11.9124C3.75 16.8848 8 19.25 12 21.4079C16 19.25 20.25 16.8848 20.25 11.9124V6.94153Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconShield;
