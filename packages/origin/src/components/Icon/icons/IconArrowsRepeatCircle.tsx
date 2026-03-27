import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowsRepeatCircle: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrows-repeat-circle, repost">
    <path
      d="M10.75 1.5L14.25 4.75L10.75 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.25 16L9.75 19.25L13.25 22.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.75 19.2502H14C18.0041 19.2502 21.25 16.0043 21.25 12.0002C21.25 9.81528 20.2834 7.85607 18.7546 6.52686"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13.25 4.75H10C5.99593 4.75 2.75 7.99594 2.75 12C2.75 14.1854 3.71696 16.145 5.24638 17.4742"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconArrowsRepeatCircle;
