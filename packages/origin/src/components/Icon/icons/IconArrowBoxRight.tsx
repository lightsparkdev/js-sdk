import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconArrowBoxRight: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="arrow-box-right, login, enter, door">
    <path
      d="M14.75 3.75L17.25 3.75C18.9069 3.75 20.25 5.09315 20.25 6.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H14.75M15 12H3.75M15 12L11.5 15.5M15 12L11.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconArrowBoxRight;
