import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBank: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="bank">
    <path
      d="M13.3528 3.18339C12.5021 2.75365 11.4979 2.75365 10.6472 3.18339L3.45605 6.81636C3.02304 7.03512 2.75 7.47896 2.75 7.9641C2.75 8.67427 3.32571 9.24998 4.03588 9.24998H19.9641C20.6743 9.24998 21.25 8.67427 21.25 7.9641C21.25 7.47896 20.977 7.03512 20.5439 6.81636L13.3528 3.18339Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M20.8594 19.0774C21.0517 19.6543 20.6223 20.25 20.0143 20.25H3.98627C3.37821 20.25 2.94884 19.6543 3.14113 19.0774C3.5049 17.9861 4.52619 17.25 5.67655 17.25H18.324C19.4743 17.25 20.4956 17.9861 20.8594 19.0774Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M19.25 9.25V17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M15.25 17.25V9.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M4.75 9.25V17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M8.75 17.25V9.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconBank;
