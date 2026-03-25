import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPassport: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="passport, visa">
    <path
      d="M9.25 16.25H14.75M15 10.5C15 12.1569 13.6569 13.5 12 13.5C10.3431 13.5 9 12.1569 9 10.5C9 8.84315 10.3431 7.5 12 7.5C13.6569 7.5 15 8.84315 15 10.5ZM7.25 20.75H16.75C18.4069 20.75 19.75 19.4069 19.75 17.75V6.25C19.75 4.59315 18.4069 3.25 16.75 3.25H7.25C5.59315 3.25 4.25 4.59315 4.25 6.25V17.75C4.25 19.4069 5.59315 20.75 7.25 20.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPassport;
