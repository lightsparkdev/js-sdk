import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconSquareBehindSquare1: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="square-behind-square-1, copy 1, layers, pages"
  >
    <path
      d="M15.25 8.75V5C15.25 3.75736 14.2426 2.75 13 2.75H5C3.75736 2.75 2.75 3.75736 2.75 5V13C2.75 14.2426 3.75736 15.25 5 15.25H8.75M11 8.75H19C20.2426 8.75 21.25 9.75736 21.25 11V19C21.25 20.2426 20.2426 21.25 19 21.25H11C9.75736 21.25 8.75 20.2426 8.75 19V11C8.75 9.75736 9.75736 8.75 11 8.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconSquareBehindSquare1;
