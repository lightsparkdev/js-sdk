import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPencil: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="pencil, edit, write">
    <path
      d="M13.25 6.24997L15.25 4.24997C16.4926 3.00733 18.5074 3.00733 19.75 4.24997C20.9926 5.49261 20.9926 7.50733 19.75 8.74997L17.75 10.75L7.83579 20.6642C7.46071 21.0393 6.95201 21.25 6.42157 21.25H2.75V17.5784C2.75 17.048 2.96071 16.5393 3.33579 16.1642L13.25 6.24997Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.25 6.25L17.75 10.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPencil;
