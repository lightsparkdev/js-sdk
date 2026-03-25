import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconRepeat: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="repeat">
    <path
      d="M7.25 18.25H5.75C4.09315 18.25 2.75 16.9069 2.75 15.25V6.75C2.75 5.09315 4.09315 3.75 5.75 3.75H18.25C19.9069 3.75 21.25 5.09315 21.25 6.75V15.25C21.25 16.9069 19.9069 18.25 18.25 18.25H12.25M15 15L11.75 18.25L15 21.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconRepeat;
