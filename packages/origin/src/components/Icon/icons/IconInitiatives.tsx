import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconInitiatives: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="initiatives, nav, rooting">
    <path
      d="M3.26389 15.0479C2.93096 14.0935 2.75 13.0679 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 13.0679 21.069 14.0935 20.7361 15.0479"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.10628 18.5379L11.1225 11.1233C11.5007 10.425 12.5028 10.425 12.8811 11.1233L16.8973 18.5379C17.3713 19.4129 16.4156 20.3678 15.541 19.8931L12.4788 18.2311C12.1813 18.0697 11.8223 18.0697 11.5248 18.2311L8.46259 19.8931C7.58805 20.3677 6.63236 19.4129 7.10628 18.5379Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconInitiatives;
