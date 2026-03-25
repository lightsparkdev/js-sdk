import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRandom: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="random, productivity, smart">
    <path
      d="M12 17.75V21.25M12 2.75V6.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.75 12L21.25 12M2.75 12H11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.45947 5.45898L12 12L5.45947 18.5405"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.0659 16.0654L18.5408 18.5403"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.0659 7.93386L18.5408 5.45898"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconRandom;
