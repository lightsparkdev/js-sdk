import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowLoopDownLeft: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrow-loop-down-left, restore, reset">
    <path
      d="M13 17.25C16.4518 17.25 19.25 14.4518 19.25 11V10.5C19.25 6.77208 16.2279 3.75 12.5 3.75C8.77208 3.75 5.75 6.77208 5.75 10.5V20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 16.5L5.75 20.25L9.5 16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowLoopDownLeft;
