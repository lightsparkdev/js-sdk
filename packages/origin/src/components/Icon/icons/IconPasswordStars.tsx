import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPasswordStars: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="password-stars">
    <path
      d="M1.75 17.25L22.25 17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9.75 9.94856H14.25M13.125 11.8971L10.875 8M10.875 11.8972L13.125 8.00005"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17.75 9.94856H22.25M21.125 11.8971L18.875 8M18.875 11.8972L21.125 8.00005"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M1.80078 9.94856H6.30078M5.17578 11.8971L2.92578 8M2.92578 11.8972L5.17578 8.00005"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconPasswordStars;
