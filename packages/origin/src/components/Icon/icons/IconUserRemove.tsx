import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserRemove: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="user-remove, people, person, member">
    <circle
      cx="12"
      cy="7.75"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0018 12.25C8.22236 12.25 5.87133 14.4212 4.94874 17.2952C4.44232 18.8728 5.84498 20.25 7.50184 20.25H11.2518"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.5 15L18 17.5M18 17.5L20.5 20M18 17.5L20.5 15M18 17.5L15.5 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconUserRemove;
