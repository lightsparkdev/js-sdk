import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserAddRight: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="user-add-right, people, person, member"
  >
    <path
      d="M4.50184 20.25C2.84498 20.25 1.44232 18.8728 1.94874 17.2952C2.87133 14.4212 5.22236 12.25 9.00184 12.25C12.7783 12.25 14.986 14.4178 15.8403 17.2885C16.3129 18.8765 14.9087 20.25 13.2518 20.25H4.50184Z"
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
      d="M20 8.5V15M23.25 11.75H16.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconUserAddRight;
