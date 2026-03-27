import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBarsThree2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="bars-three-2, menu, list, hamburger">
    <path
      d="M2.75 12H21.25M2.75 5.75H21.25M2.75 18.25H11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconBarsThree2;
