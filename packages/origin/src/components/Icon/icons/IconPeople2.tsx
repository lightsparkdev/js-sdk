import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPeople2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="people-2">
    <path
      d="M16.75 7.5C16.75 10.1234 14.6234 12.25 12 12.25C9.37665 12.25 7.25 10.1234 7.25 7.5C7.25 4.87665 9.37665 2.75 12 2.75C14.6234 2.75 16.75 4.87665 16.75 7.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 20.25V18.75C3.75 16.5409 5.54086 14.75 7.75 14.75H16.25C18.4591 14.75 20.25 16.5409 20.25 18.75V20.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPeople2;
