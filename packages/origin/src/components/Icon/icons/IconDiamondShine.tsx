import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconDiamondShine: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="diamond-shine, pop, polish">
    <path
      d="M16.8423 8.37249C16.4647 7.97504 15.9406 7.75 15.3923 7.75H8.60958C8.06135 7.75 7.53716 7.97505 7.15957 8.37251L4.3078 11.3744C3.57522 12.1456 3.57438 13.3552 4.3059 14.1274L10.549 20.7174C11.3378 21.5501 12.6639 21.5501 13.4528 20.7174L19.6961 14.1274C20.4276 13.3552 20.4268 12.1456 19.6942 11.3744L16.8423 8.37249Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 12.75H19.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 2.75V4.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.5 4.5L19.5 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 4.5L4.5 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconDiamondShine;
