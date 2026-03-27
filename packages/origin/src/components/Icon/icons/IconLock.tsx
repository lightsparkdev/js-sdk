import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconLock: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="lock, private">
    <path
      d="M7.75 9.75H16.25M7.75 9.75C6.09315 9.75 4.75 11.0931 4.75 12.75V18.25C4.75 19.9069 6.09315 21.25 7.75 21.25H16.25C17.9069 21.25 19.25 19.9069 19.25 18.25V12.75C19.25 11.0931 17.9069 9.75 16.25 9.75M7.75 9.75V7.25C7.75 4.90279 9.65279 3 12 3C14.3472 3 16.25 4.90279 16.25 7.25V9.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconLock;
