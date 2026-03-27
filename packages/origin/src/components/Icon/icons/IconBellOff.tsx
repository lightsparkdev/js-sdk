import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBellOff: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="bell-off, notification off, activity, alert"
  >
    <path
      d="M16 17.25C16 19.4591 14.2091 21.25 12 21.25C9.79086 21.25 8 19.4591 8 17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.84246 6C5.16656 6.98803 4.72068 8.15073 4.58578 9.41531L3.72773 13.6549C3.35164 15.5132 4.77216 17.25 6.66811 17.25H16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.1167 16L19.4142 9.4153C19.0098 5.62501 15.8118 2.75 12 2.75C10.5347 2.75 9.16008 3.17485 8 3.91323"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 2.75L21.25 21.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconBellOff;
