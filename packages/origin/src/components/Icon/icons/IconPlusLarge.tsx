import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPlusLarge: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="plus-large, add large">
    <path
      d="M12 3.75V12M12 12V20.25M12 12H3.75M12 12H20.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPlusLarge;
