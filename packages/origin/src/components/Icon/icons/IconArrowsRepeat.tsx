import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowsRepeat: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrows-repeat, repost">
    <path
      d="M3.75 13.25V7.75C3.75 6.09315 5.09315 4.75 6.75 4.75H15.1071"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.6455 1.75L15.7527 4.75L12.6455 7.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.2502 10.75V16.25C20.2502 17.9069 18.9071 19.25 17.2502 19.25H8.89307"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.3542 22.25L8.24707 19.25L11.3542 16.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowsRepeat;
