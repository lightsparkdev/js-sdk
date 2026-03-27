import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCirclePlus: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="circle-plus, add">
    <path
      d="M16.2426 12.0005H7.75736M12 16.2431V7.75781M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconCirclePlus;
