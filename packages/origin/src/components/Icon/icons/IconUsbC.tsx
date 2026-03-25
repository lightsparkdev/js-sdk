import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUsbC: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="usb-c, type-c">
    <path
      d="M5.75 12H18.25M6 17.25H18C20.8995 17.25 23.25 14.8995 23.25 12C23.25 9.10051 20.8995 6.75 18 6.75H6C3.10051 6.75 0.75 9.10051 0.75 12C0.75 14.8995 3.10051 17.25 6 17.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconUsbC;
