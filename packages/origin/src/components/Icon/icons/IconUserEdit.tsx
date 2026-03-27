import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserEdit: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="user-edit, people, person, member">
    <circle
      cx="12"
      cy="7.75"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0018 12.25C8.22236 12.25 5.87133 14.4212 4.94874 17.2952C4.44232 18.8728 5.84498 20.25 7.50184 20.25H10.252"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 20.25V18.826C13.75 18.0303 14.0661 17.2673 14.6287 16.7047L17.75 13.5833C18.4864 12.847 19.6803 12.847 20.4167 13.5833C21.153 14.3197 21.153 15.5136 20.4167 16.25L17.2953 19.3713C16.7327 19.9339 15.9697 20.25 15.174 20.25H13.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconUserEdit;
