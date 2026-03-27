import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRescueRing: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="rescue-ring, swim-boyle, help, support"
  >
    <path
      d="M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16.25 12C16.25 14.3472 14.3472 16.25 12 16.25C9.65279 16.25 7.75 14.3472 7.75 12C7.75 9.65279 9.65279 7.75 12 7.75C14.3472 7.75 16.25 9.65279 16.25 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.5013 5.5L14.8672 9.13411"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9.1289 14.8711L5.5 18.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M5.5 5.5L9.1289 9.1289" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M14.8672 14.866L18.5013 18.5001"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </CentralIconBase>
);

export default IconRescueRing;
