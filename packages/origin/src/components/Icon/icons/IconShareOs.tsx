import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconShareOs: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="share-os">
    <path
      d="M7.75 6.25L12 1.75L16.25 6.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 2.75V13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.25 9.75C17.9069 9.75 19.25 11.0931 19.25 12.75V17.25C19.25 18.9069 17.9069 20.25 16.25 20.25H7.75C6.09315 20.25 4.75 18.9069 4.75 17.25V12.75C4.75 11.0931 6.09315 9.75 7.75 9.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconShareOs;
