import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPlusSmall: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="plus-small, add small">
    <path
      d="M12 6.75V12M12 12V17.25M12 12H6.75M12 12H17.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconPlusSmall;
