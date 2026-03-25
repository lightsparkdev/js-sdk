import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCheckmark2Small: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="checkmark-2-small">
    <path
      d="M6.75 13.0625L9.9 16.25L17.25 7.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconCheckmark2Small;
