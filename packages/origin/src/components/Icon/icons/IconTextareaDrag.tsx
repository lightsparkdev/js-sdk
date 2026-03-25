import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconTextareaDrag: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="textarea-drag">
    <path
      d="M14.75 21.25L21.25 14.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6.75 21.25L21.25 6.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconTextareaDrag;
