import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBuildings: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="buildings, company, workspace">
    <path
      d="M10.25 8.75H7.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 12.75H10.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.25 19.25H1.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 19.25V6.75C3.75 5.09315 5.09315 3.75 6.75 3.75H11.25C12.9069 3.75 14.25 5.09315 14.25 6.75V19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.25 7.75H17.25C18.9069 7.75 20.25 9.09315 20.25 10.75V19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconBuildings;
