import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPeopleAdd: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="people-add, user-add">
    <path
      d="M15.75 6.5C15.75 8.57107 14.0711 10.25 12 10.25C9.92893 10.25 8.25 8.57107 8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.9997 13.838C14.1003 13.4592 13.0925 13.25 11.9997 13.25C9.02123 13.25 6.67402 14.8039 5.43304 17.1121C4.59593 18.6691 6.02717 20.25 7.79494 20.25H12.2497"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.25 15.25V18.25M18.25 18.25V21.25M18.25 18.25H15.25M18.25 18.25H21.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPeopleAdd;
