import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPeopleIdCard: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="people-id-card, profile, user-account, badge, person"
  >
    <path
      d="M16.75 2.75H7.25C5.59315 2.75 4.25 4.09315 4.25 5.75V18.25C4.25 19.9069 5.59315 21.25 7.25 21.25H16.75C18.4069 21.25 19.75 19.9069 19.75 18.25V5.75C19.75 4.09315 18.4069 2.75 16.75 2.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12.25"
      r="2.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16 21C16 18.7909 14.2091 17 12 17C9.79086 17 8 18.7909 8 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9.75 6.25H14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconPeopleIdCard;
