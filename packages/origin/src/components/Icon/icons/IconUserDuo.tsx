import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserDuo: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="user-duo, team, members, persons">
    <path
      d="M4.75 19.25C3.09315 19.25 1.67671 17.8733 2.16196 16.2891C2.86531 13.9928 4.51906 12.25 7.5 12.25C10.4809 12.25 12.1347 13.9928 12.838 16.2891C13.3233 17.8733 11.9069 19.25 10.25 19.25H4.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.75 18.25H19.25C20.9069 18.25 22.3599 16.8654 21.852 15.2884C21.249 13.4161 19.9142 12.25 17.5357 12.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7.5"
      cy="8.5"
      r="3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="17.5"
      cy="9.5"
      r="2.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconUserDuo;
