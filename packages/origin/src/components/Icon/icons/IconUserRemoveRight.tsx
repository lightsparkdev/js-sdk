import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserRemoveRight: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="user-remove-right, people, person, member"
  >
    <path
      d="M4.5 20.25C2.84315 20.25 1.44049 18.8728 1.9469 17.2952C2.86949 14.4212 5.22053 12.25 9 12.25C12.7765 12.25 14.9842 14.4178 15.8385 17.2885C16.3111 18.8765 14.9069 20.25 13.25 20.25H4.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="7.75"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 9L20 11.5M20 11.5L22.5 14M20 11.5L22.5 9M20 11.5L17.5 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconUserRemoveRight;
