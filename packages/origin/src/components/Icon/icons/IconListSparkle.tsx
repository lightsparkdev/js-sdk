import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconListSparkle: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="list-sparkle, ai text, text generation"
  >
    <path
      d="M3.75 18.25H7.25M3.75 12H9.25M3.75 5.75H20.25M17 10.5L18.5 13.5L21.5 15L18.5 16.5L17 19.5L15.5 16.5L12.5 15L15.5 13.5L17 10.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconListSparkle;
