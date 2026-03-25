import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBell: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="bell, notification, activity, alert">
    <path
      d="M4.35988 9.38732C4.89728 5.58041 8.15531 2.75 12 2.75C15.8446 2.75 19.1026 5.58042 19.64 9.38732L20.2673 13.8307C20.5222 15.6364 19.1204 17.25 17.2967 17.25H6.70319C4.87955 17.25 3.47773 15.6364 3.73264 13.8307L4.35988 9.38732Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17.25C16 19.4591 14.2091 21.25 12 21.25C9.79086 21.25 8 19.4591 8 17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconBell;
