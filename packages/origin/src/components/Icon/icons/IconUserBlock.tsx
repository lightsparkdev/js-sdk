import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserBlock: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="user-block, people, person, member, blocked"
  >
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
      d="M12.0018 12.25C8.22236 12.25 5.87133 14.4212 4.94874 17.2952C4.44232 18.8728 5.84498 20.25 7.50184 20.25H11.252"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="18"
      cy="17.25"
      r="3.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M15.7461 19.5L20.2461 15"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </CentralIconBase>
);

export default IconUserBlock;
